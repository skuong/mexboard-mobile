import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View,
} from "react-native";
import * as Device from "expo-device";
import { SafeAreaView } from "react-native-safe-area-context";
import Zeroconf, { ImplType } from "react-native-zeroconf";

type ResolvedService = {
  name?: string;
  fullName?: string;
  host?: string;
  port?: number;
  addresses?: string[];
  txt?: Record<string, string>;
};

const SERVICE_TYPE = "http";
const SERVICE_PROTOCOL = "tcp";
const SERVICE_DOMAIN = "local.";
const PUBLISH_TYPE = SERVICE_TYPE;
const IMPL: ImplType = ImplType.NSD;

export default function ZeroconfLabScreen() {
  const zeroconfRef = useRef<Zeroconf | null>(null);
  const publishedNameRef = useRef<string | null>(null);
  const isScanningRef = useRef(false);
  const isPublishingRef = useRef(false);

  const [isScanning, setIsScanning] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const [serviceName, setServiceName] = useState("Phone");
  const [port, setPort] = useState("38421");
  const [txtRole, setTxtRole] = useState("mobile");
  const [txtVersion, setTxtVersion] = useState("1");

  const [logs, setLogs] = useState<string[]>([]);

  useEffect(() => {
    const name = Device.modelName ?? Device.brand ?? "Phone";
    setServiceName(name.replace(/\s+/g, "-"));
  }, []);
  const [services, setServices] = useState<Record<string, ResolvedService>>({});

  const sortedServices = useMemo(() => {
    return Object.entries(services).sort((a, b) => {
      const nameA = a[1]?.name ?? a[0];
      const nameB = b[1]?.name ?? b[0];
      return nameA.localeCompare(nameB);
    });
  }, [services]);

  const addLog = (message: string) => {
    setLogs((prev) => {
      const next = [`${new Date().toLocaleTimeString()}  ${message}`, ...prev];
      return next.slice(0, 100);
    });
  };

  const setScanningState = (value: boolean) => {
    isScanningRef.current = value;
    setIsScanning(value);
  };

  const setPublishingState = (value: boolean) => {
    isPublishingRef.current = value;
    setIsPublishing(value);
  };

  useEffect(() => {
    const zeroconf = new Zeroconf();
    zeroconfRef.current = zeroconf;

    const onStart = () => {
      setScanningState(true);
      addLog(`Scan started via ${IMPL}`);
    };

    const onStop = () => {
      setScanningState(false);
      addLog(`Scan stopped via ${IMPL}`);
    };

    const onFound = (name: string) => {
      addLog(`Found: ${name}`);
    };

    const onResolved = (service: ResolvedService) => {
      const key =
        service.fullName ?? service.name ?? `${service.host}:${service.port}`;

      setServices((prev) => ({
        ...prev,
        [key]: service,
      }));

      addLog(
        `Resolved: ${service.name ?? "unknown"} → ${service.addresses?.[0] ?? "?"}:${service.port ?? "?"}`,
      );
    };

    const onRemove = (name: string) => {
      setServices((prev) => {
        const next = { ...prev };
        for (const [key, value] of Object.entries(next)) {
          if (value.name === name || value.fullName === name) {
            delete next[key];
          }
        }
        return next;
      });

      addLog(`Removed: ${name}`);
    };

    const onUpdate = () => {
      addLog("Services updated");
    };

    const onPublished = (service: ResolvedService) => {
      addLog(`Published event: ${service.name ?? "unknown"}`);
    };

    const onUnpublished = (service: ResolvedService) => {
      addLog(`Unpublished event: ${service.name ?? "unknown"}`);
    };

    const onError = (error: unknown) => {
      const message =
        error instanceof Error ? error.message : JSON.stringify(error);
      addLog(`Error: ${message}`);
    };

    zeroconf.on("start", onStart);
    zeroconf.on("stop", onStop);
    zeroconf.on("found", onFound);
    zeroconf.on("resolved", onResolved);
    zeroconf.on("remove", onRemove);
    zeroconf.on("update", onUpdate);
    zeroconf.on("published", onPublished);
    zeroconf.on("unpublished", onUnpublished);
    zeroconf.on("error", onError);

    return () => {
      try {
        if (isScanningRef.current) {
          zeroconf.stop(IMPL);
        }
      } catch {}

      try {
        if (publishedNameRef.current) {
          zeroconf.unpublishService(publishedNameRef.current, IMPL);
        }
      } catch {}

      zeroconf.removeDeviceListeners?.();
      zeroconfRef.current = null;
    };
  }, []);

  const startScan = async () => {
    const zeroconf = zeroconfRef.current;
    if (!zeroconf) return;

    try {
      if (isScanningRef.current) {
        zeroconf.stop(IMPL);
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      setServices({});
      addLog(
        `Scanning ${SERVICE_TYPE}.${SERVICE_PROTOCOL}.${SERVICE_DOMAIN} via ${IMPL}`,
      );

      zeroconf.scan(SERVICE_TYPE, SERVICE_PROTOCOL, SERVICE_DOMAIN, IMPL);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      addLog(`Scan error: ${message}`);
    }
  };

  const stopScan = () => {
    const zeroconf = zeroconfRef.current;
    if (!zeroconf || !isScanningRef.current) return;

    try {
      zeroconf.stop(IMPL);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      addLog(`Stop error: ${message}`);
    }
  };

  const publishService = () => {
    const zeroconf = zeroconfRef.current;
    if (!zeroconf) return;

    const parsedPort = Number(port);
    const instanceName = serviceName.trim();

    if (!instanceName) {
      Alert.alert("Missing name", "Please enter a service name.");
      return;
    }

    if (
      !Number.isInteger(parsedPort) ||
      parsedPort <= 0 ||
      parsedPort > 65535
    ) {
      Alert.alert(
        "Invalid port",
        "Port must be an integer between 1 and 65535.",
      );
      return;
    }

    try {
      zeroconf.publishService(
        PUBLISH_TYPE,
        SERVICE_PROTOCOL,
        SERVICE_DOMAIN,
        instanceName,
        parsedPort,
        {
          role: txtRole.trim() || "mobile",
          ver: txtVersion.trim() || "1",
          platform: "expo",
          hostname: Device.deviceName,
        },
        IMPL,
      );

      publishedNameRef.current = instanceName;
      setPublishingState(true);
      addLog(`Published: ${instanceName} on ${parsedPort} via ${IMPL}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      addLog(`Publish error: ${message}`);
      Alert.alert("Publish failed", message);
    }
  };

  const stopPublishing = () => {
    const zeroconf = zeroconfRef.current;
    const currentPublishedName = publishedNameRef.current;

    if (!zeroconf || !currentPublishedName) return;

    try {
      zeroconf.unpublishService(currentPublishedName, IMPL);
      publishedNameRef.current = null;
      setPublishingState(false);
      addLog(`Service unpublished via ${IMPL}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      addLog(`Unpublish error: ${message}`);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }} className="flex-1 bg-zinc-950">
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        <View className="mb-6">
          <Text className="text-3xl font-bold text-white">Zeroconf Lab</Text>
          <Text className="mt-2 text-sm leading-6 text-zinc-400">
            Scan for local services and broadcast this device for mDNS testing.
          </Text>
        </View>

        <View className="mb-4 rounded-3xl border border-zinc-800 bg-zinc-900 p-4">
          <Text className="text-xs uppercase tracking-[2px] text-zinc-500">
            Service target
          </Text>
          <Text className="mt-2 text-base text-white">
            {SERVICE_TYPE}.{SERVICE_PROTOCOL}.{SERVICE_DOMAIN}
          </Text>
          <Text className="mt-2 text-sm text-zinc-400">
            Publish type: {PUBLISH_TYPE}
          </Text>
          <Text className="mt-1 text-sm text-zinc-400">
            Android impl: {IMPL}
          </Text>
        </View>

        <View className="mb-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-4">
          <View className="mb-4 flex-row items-center justify-between">
            <View>
              <Text className="text-lg font-semibold text-white">
                Discovery
              </Text>
              <Text className="text-sm text-zinc-400">
                Browse devices on the same Wi‑Fi.
              </Text>
            </View>

            <View className="rounded-full border border-zinc-700 px-3 py-1">
              <Text
                className={isScanning ? "text-emerald-400" : "text-zinc-400"}
              >
                {isScanning ? "Scanning" : "Idle"}
              </Text>
            </View>
          </View>

          <View className="flex-row gap-3">
            <Pressable
              onPress={startScan}
              className="flex-1 rounded-2xl bg-emerald-500 px-4 py-3 active:opacity-80"
            >
              <Text className="text-center font-semibold text-zinc-950">
                Start scan
              </Text>
            </Pressable>

            <Pressable
              onPress={stopScan}
              className="flex-1 rounded-2xl border border-zinc-700 bg-zinc-800 px-4 py-3 active:opacity-80"
            >
              <Text className="text-center font-semibold text-white">
                Stop scan
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="mb-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-4">
          <View className="mb-4 flex-row items-center justify-between">
            <View>
              <Text className="text-lg font-semibold text-white">
                Broadcast
              </Text>
              <Text className="text-sm text-zinc-400">
                Publish this phone as a local service.
              </Text>
            </View>

            <Switch
              value={isPublishing}
              onValueChange={(value) => {
                if (value) publishService();
                else stopPublishing();
              }}
            />
          </View>

          <View className="gap-3">
            <Field
              label="Service name"
              value={serviceName}
              onChangeText={setServiceName}
              placeholder="Mexhov Phone"
            />
            <Field
              label="Port"
              value={port}
              onChangeText={setPort}
              placeholder="38421"
              keyboardType="number-pad"
            />
            <Field
              label="TXT role"
              value={txtRole}
              onChangeText={setTxtRole}
              placeholder="mobile"
            />
            <Field
              label="TXT version"
              value={txtVersion}
              onChangeText={setTxtVersion}
              placeholder="1"
            />
          </View>

          <View className="mt-4 flex-row gap-3">
            <Pressable
              onPress={publishService}
              className="flex-1 rounded-2xl bg-sky-500 px-4 py-3 active:opacity-80"
            >
              <Text className="text-center font-semibold text-slate-950">
                Publish
              </Text>
            </Pressable>

            <Pressable
              onPress={stopPublishing}
              className="flex-1 rounded-2xl border border-zinc-700 bg-zinc-800 px-4 py-3 active:opacity-80"
            >
              <Text className="text-center font-semibold text-white">
                Unpublish
              </Text>
            </Pressable>
          </View>
        </View>

        <View className="mb-6 rounded-3xl border border-zinc-800 bg-zinc-900 p-4">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-white">Services</Text>
            <Text className="text-sm text-zinc-400">
              {sortedServices.length} discovered
            </Text>
          </View>

          {sortedServices.length === 0 ? (
            <EmptyState text="No services resolved yet. Start a scan on the same local network." />
          ) : (
            <View className="gap-3">
              {sortedServices.map(([key, service]) => {
                const ip =
                  service.addresses?.find((addr) => addr.includes(".")) ??
                  service.addresses?.[0] ??
                  "—";

                return (
                  <View
                    key={key}
                    className="rounded-2xl border border-zinc-800 bg-zinc-950/80 p-4"
                  >
                    <View className="flex-row items-start justify-between gap-3">
                      <View className="flex-1">
                        <Text className="text-base font-semibold text-white">
                          {service.name ?? "Unnamed service"}
                        </Text>
                        <Text className="mt-1 text-sm text-zinc-400">
                          {service.host ?? "No host"}
                        </Text>
                      </View>

                      <View className="rounded-full bg-zinc-800 px-3 py-1">
                        <Text className="text-xs text-zinc-300">
                          {service.port ?? "?"}
                        </Text>
                      </View>
                    </View>

                    <View className="mt-3 gap-1">
                      <MetaRow label="IPv4" value={ip} />
                      <MetaRow
                        label="Full name"
                        value={service.fullName ?? "—"}
                      />
                      <MetaRow
                        label="TXT"
                        value={service.txt ? JSON.stringify(service.txt) : "—"}
                      />
                    </View>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        <View className="rounded-3xl border border-zinc-800 bg-zinc-900 p-4">
          <View className="mb-3 flex-row items-center justify-between">
            <Text className="text-lg font-semibold text-white">Logs</Text>
            <Pressable
              onPress={() => setLogs([])}
              className="rounded-full border border-zinc-700 px-3 py-1 active:opacity-80"
            >
              <Text className="text-xs font-medium text-zinc-300">Clear</Text>
            </Pressable>
          </View>

          {logs.length === 0 ? (
            <EmptyState text="No events yet." />
          ) : (
            <View className="gap-2">
              {logs.map((log, index) => (
                <Text
                  key={`${log}-${index}`}
                  className="text-xs leading-5 text-zinc-400"
                >
                  {log}
                </Text>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: "default" | "number-pad";
};

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType = "default",
}: FieldProps) {
  return (
    <View>
      <Text className="mb-2 text-sm font-medium text-zinc-300">{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor="#71717a"
        keyboardType={keyboardType}
        className="rounded-2xl border border-zinc-700 bg-zinc-950 px-4 py-3 text-white"
      />
    </View>
  );
}

function MetaRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-start gap-3">
      <Text className="w-20 text-xs uppercase tracking-[1.5px] text-zinc-500">
        {label}
      </Text>
      <Text className="flex-1 text-sm text-zinc-300">{value}</Text>
    </View>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <View className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-950/70 p-4">
      <Text className="text-sm leading-6 text-zinc-400">{text}</Text>
    </View>
  );
}

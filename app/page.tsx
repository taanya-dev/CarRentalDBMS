"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type Tab = "Overview" | "Vehicles" | "Rentals" | "Telemetry" | "Billing";

type Vehicle = {
  Vehicle_ID: number;
  Registration_No: string;
  Model: string;
  Type: string | null;
  Year: number | null;
  Fuel_Type: string | null;
  Base_Rate: number | string;
  Branch_ID: number;
};

type DashboardData = {
  totalVehicles: number;
  totalRentals: number;
  totalBills: number;
  pendingPayments: number | string;
  fleetStatus: {
    currentlyRented: number;
    notCurrentlyRented: number;
    utilizationPercent: number;
  };
};

type Customer = {
  Customer_ID: number;
  First_Name: string;
  Last_Name: string;
  Email: string | null;
};

export default function Home() {
  const router = useRouter();
  const [authLoading, setAuthLoading] = useState(true);
  const [authUser, setAuthUser] = useState<{ username: string; role: "Admin" | "Staff" } | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function checkSession() {
      try {
        const response = await fetch("/api/auth/me", { cache: "no-store" });
        const data = await response.json();

        if (cancelled) return;

        // The /api/auth/me route returns { user } when authenticated.
        if (response.ok && data.user) {
          setAuthUser(data.user);
        } else {
          router.replace("/login");
        }
      } catch {
        if (!cancelled) router.replace("/login");
      } finally {
        if (!cancelled) setAuthLoading(false);
      }
    }

    void checkSession();
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleLogout() {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      setAuthUser(null);
      router.replace("/login");
      router.refresh();
    }
  }

  const [activeTab, setActiveTab] = useState<Tab>("Overview");
  const [search, setSearch] = useState("");
  const [showBooking, setShowBooking] = useState(false);
  const [notice, setNotice] = useState("");

  const [dashboardData, setDashboardData] =
    useState<DashboardData | null>(null);
  const [dashboardError, setDashboardError] = useState("");
  const [dashboardLoading, setDashboardLoading] = useState(true);

  const [dbVehicles, setDbVehicles] = useState<Vehicle[]>([]);
  const [vehiclesLoading, setVehiclesLoading] = useState(false);
  const [vehiclesError, setVehiclesError] = useState("");
  const [currentDate, setCurrentDate] = useState("");
  const [dbRentals, setDbRentals] = useState<any[]>([]);
  const [rentalsLoading, setRentalsLoading] = useState(false);
  const [rentalsError, setRentalsError] = useState("");
  const [dbBills, setDbBills] = useState<any[]>([]);
  const [billsLoading, setBillsLoading] = useState(false);
  const [billsError, setBillsError] = useState("");
  const [updatingBillId, setUpdatingBillId] = useState<number | null>(null);
  const [telemetry, setTelemetry] = useState<any[]>([]);
  const [telemetryLoading, setTelemetryLoading] = useState(false);
  const [telemetryError, setTelemetryError] = useState("");
  const [bookingSubmitting, setBookingSubmitting] = useState(false);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(false);
  const [customersError, setCustomersError] = useState("");
  const [showAddCustomer, setShowAddCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
  licenseNo: "",
  firstName: "",
  lastName: "",
  email: "",
});
  
  useEffect(() => {
    setCurrentDate(new Date().toLocaleDateString("en-IN", {
      day: "numeric", month: "long", year: "numeric",
    }));
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function loadDashboard() {
      try {
        setDashboardLoading(true);
        setDashboardError("");

        const response = await fetch("/api/dashboard");
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.error || "Unable to load dashboard data."
          );
        }

        if (!cancelled) {
          setDashboardData({
            totalVehicles: Number(data.totalVehicles),
            totalRentals: Number(data.totalRentals),
            totalBills: Number(data.totalBills),
            pendingPayments: Number(data.pendingPayments),
            fleetStatus: {
              currentlyRented: Number(data.fleetStatus?.currentlyRented ?? 0),
              notCurrentlyRented: Number(data.fleetStatus?.notCurrentlyRented ?? 0),
              utilizationPercent: Number(data.fleetStatus?.utilizationPercent ?? 0),
            },
          });
        }
      } catch (error) {
        if (!cancelled) {
          setDashboardError(
            error instanceof Error
              ? error.message
              : "Unable to connect to the dashboard API."
          );
        }
      } finally {
        if (!cancelled) {
          setDashboardLoading(false);
        }
      }
    }

    loadDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadVehicles() {
      try {
        setVehiclesLoading(true);
        setVehiclesError("");

        const response = await fetch("/api/vehicles");
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Unable to load vehicles from MySQL.");
        }

        if (!cancelled) {
          setDbVehicles(Array.isArray(data.vehicles) ? data.vehicles : []);
        }
      } catch (error) {
        if (!cancelled) {
          setVehiclesError(
            error instanceof Error ? error.message : "Unable to load vehicles."
          );
        }
      } finally {
        if (!cancelled) {
          setVehiclesLoading(false);
        }
      }
    }

    loadVehicles();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadCustomers() {
      try {
        setCustomersLoading(true);
        setCustomersError("");

        const response = await fetch("/api/customers", { cache: "no-store" });
        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(data.error || "Unable to load customers.");
        }

        if (!cancelled) {
          setCustomers(Array.isArray(data.customers) ? data.customers : []);
          console.log("Customers received:", data.customers);
        }
      } catch (error) {
        if (!cancelled) {
          setCustomersError(
            error instanceof Error ? error.message : "Unable to load customers."
          );
        }
      } finally {
        if (!cancelled) setCustomersLoading(false);
      }
    }

    void loadCustomers();
    return () => {
      cancelled = true;
    };
  }, []);

  async function loadRentals() {
    setRentalsLoading(true);
    setRentalsError("");
    try {
      const response = await fetch("/api/rentals", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Could not load rentals.");
      setDbRentals(Array.isArray(data.rentals) ? data.rentals : []);
    } catch (error) {
      setRentalsError(error instanceof Error ? error.message : "Could not load rentals.");
    } finally { setRentalsLoading(false); }
  }

  async function loadBills() {
    setBillsLoading(true);
    setBillsError("");
    try {
      const response = await fetch("/api/billing", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Could not load billing records.");
      setDbBills(Array.isArray(data.bills) ? data.bills : []);
    } catch (error) {
      setBillsError(error instanceof Error ? error.message : "Could not load billing records.");
    } finally { setBillsLoading(false); }
  }

  async function updateBill(billId: number, status: "Paid" | "Pending") {
    const confirmed = window.confirm(
      status === "Paid"
        ? `Confirm that payment for Bill #${billId} has been received?`
        : `Mark Bill #${billId} as Pending / unpaid?`
    );
    if (!confirmed) return;

    setUpdatingBillId(billId);
    setBillsError("");
    setNotice("");

    try {
      const response = await fetch("/api/billing", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        cache: "no-store",
        body: JSON.stringify({ billId, status }),
      });
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.error || "Could not update payment status.");
      }

      setNotice(result.message || `Bill #${billId} updated to ${status}.`);
      await loadBills();

      // Refresh the dashboard totals so Pending Payments reflects this update.
      const dashboardResponse = await fetch("/api/dashboard", { cache: "no-store" });
      const dashboard = await dashboardResponse.json();
      if (dashboardResponse.ok && dashboard.success) {
        setDashboardData({
          totalVehicles: Number(dashboard.totalVehicles),
          totalRentals: Number(dashboard.totalRentals),
          totalBills: Number(dashboard.totalBills),
          pendingPayments: Number(dashboard.pendingPayments),
          fleetStatus: {
            currentlyRented: Number(dashboard.fleetStatus?.currentlyRented ?? 0),
            notCurrentlyRented: Number(dashboard.fleetStatus?.notCurrentlyRented ?? 0),
            utilizationPercent: Number(dashboard.fleetStatus?.utilizationPercent ?? 0),
          },
        });
      }
    } catch (error) {
      setBillsError(
        error instanceof Error ? error.message : "Unable to update payment status."
      );
    } finally {
      setUpdatingBillId(null);
    }
  }

  async function loadTelemetry() {
    setTelemetryLoading(true);
    setTelemetryError("");
    try {
      const response = await fetch("/api/telemetry", { cache: "no-store" });
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.error || "Could not load telemetry.");
      setTelemetry(Array.isArray(data.telemetry) ? data.telemetry : []);
    } catch (error) {
      setTelemetryError(error instanceof Error ? error.message : "Could not load telemetry.");
    } finally { setTelemetryLoading(false); }
  }

  useEffect(() => {
    if (activeTab === "Rentals" || activeTab === "Overview") void loadRentals();
    if (activeTab === "Billing") void loadBills();
    if (activeTab === "Telemetry") void loadTelemetry();
  }, [activeTab]);

  const filteredDbVehicles = dbVehicles.filter((v) =>
    `${v.Registration_No} ${v.Model} ${v.Type ?? ""} ${v.Fuel_Type ?? ""} ${v.Branch_ID}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const navItems: { name: Tab; icon: string }[] = [
    { name: "Overview", icon: "▦" },
    { name: "Vehicles", icon: "▣" },
    { name: "Rentals", icon: "▤" },
    { name: "Telemetry", icon: "⌁" },
    { name: "Billing", icon: "₹" },
  ];

  function changeTab(tab: Tab) {
    setActiveTab(tab);
    setSearch("");
    setNotice("");
  }

  const stats = [
    {
      label: "Total vehicles",
      value: dashboardData?.totalVehicles,
      change: "Registered in MySQL",
      icon: "▣",
      color: "bg-blue-50 text-blue-700",
    },
    {
      label: "Total rentals",
      value: dashboardData?.totalRentals,
      change: "Rental records in MySQL",
      icon: "↗",
      color: "bg-violet-50 text-violet-700",
    },
    {
      label: "Total bills",
      value: dashboardData?.totalBills,
      change: "Billing records in MySQL",
      icon: "✓",
      color: "bg-emerald-50 text-emerald-700",
    },
    {
      label: "Pending payments",
      value:
        dashboardData === null
          ? undefined
          : `₹${Number(dashboardData.pendingPayments).toLocaleString("en-IN")}`,
      change: "Unpaid invoices in MySQL",
      icon: "₹",
      color: "bg-amber-50 text-amber-700",
    },
  ];

  if (authLoading || !authUser) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f5f7fb] text-slate-600">
        {authLoading ? "Checking your ROADWISE session..." : "Redirecting to login..."}
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f5f7fb] text-slate-800">
      <div className="flex min-h-screen">
        <aside className="hidden w-64 shrink-0 flex-col bg-[#111c35] text-white md:flex">
          <div className="flex h-20 items-center gap-3 border-b border-white/10 px-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400 text-xl font-bold text-[#111c35]">
              R
            </div>
            <div>
              <p className="text-lg font-bold tracking-wide">ROADWISE</p>
              <p className="text-xs text-slate-400">Fleet Intelligence</p>
            </div>
          </div>

          <div className="px-4 pt-8">
            <p className="mb-3 px-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-slate-500">
              Workspace
            </p>

            <nav className="space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.name}
                  onClick={() => changeTab(item.name)}
                  className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-left text-sm transition ${
                    activeTab === item.name
                      ? "bg-cyan-400 font-semibold text-[#111c35]"
                      : "text-slate-300 hover:bg-white/10"
                  }`}
                >
                  <span className="w-5 text-lg">{item.icon}</span>
                  {item.name}

                  {item.name === "Telemetry" && (
                    <span
                      title={telemetryError ? "Telemetry disconnected" : telemetry.length > 0 ? "Telemetry data loaded" : telemetryLoading ? "Checking telemetry" : "Telemetry not checked"}
                      className={`ml-auto h-2 w-2 rounded-full ${
                        telemetryError
                          ? "bg-red-400"
                          : telemetryLoading
                            ? "bg-amber-400"
                            : telemetry.length > 0
                              ? "bg-emerald-400"
                              : "bg-slate-500"
                      }`}
                    />
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="mt-auto p-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
                <span className={`h-2 w-2 rounded-full ${dashboardError ? "bg-red-400" : dashboardLoading ? "bg-amber-400" : dashboardData ? "bg-emerald-400" : "bg-slate-400"}`} />
                System status
              </div>
              <p className="text-xs leading-5 text-slate-400">
                {dashboardData
                  ? "MySQL dashboard connection successful."
                  : dashboardLoading
                    ? "Connecting to the database..."
                    : "Dashboard data could not be loaded."}
              </p>
            </div>

            <div className="mt-5 flex items-center gap-3 border-t border-white/10 pt-5">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-400 font-bold text-white">
                A
              </div>
              <div>
                <p className="text-sm font-medium">{authUser.username}</p>
                <p className="text-xs text-slate-400">{authUser.role === "Admin" ? "Fleet administrator" : "Fleet staff"}</p>
              </div>
            </div>
          </div>
        </aside>

        <section className="min-w-0 flex-1">
          <header className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-5 sm:px-8">
            <div>
              <p className="text-xs font-medium text-slate-400">
                FLEET MANAGEMENT / {activeTab.toUpperCase()}
              </p>
              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900">
                {activeTab === "Overview" ? "Fleet overview" : activeTab}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                Smart Car Rental &amp; Vehicle Telemetry Management
              </p>
            </div>

            <div className="flex items-center gap-3">
              <span className={`hidden items-center gap-2 rounded-full px-3 py-2 text-xs font-medium sm:flex ${
                dashboardError
                  ? "bg-red-50 text-red-700"
                  : dashboardLoading
                    ? "bg-amber-50 text-amber-700"
                    : "bg-emerald-50 text-emerald-700"
              }`}>
                <span className={`h-2 w-2 rounded-full ${
                  dashboardError ? "bg-red-500" : dashboardLoading ? "bg-amber-500" : "bg-emerald-500"
                }`} />
                {dashboardError ? "Database error" : dashboardLoading ? "Connecting..." : "Database connected"}
              </span>

              <span className="hidden rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-600 sm:inline">{authUser.username} · {authUser.role}</span>
              <button onClick={() => changeTab("Billing")} className="hidden rounded-xl border border-slate-200 px-3 py-3 text-sm font-semibold sm:inline">Billing</button>
              <button onClick={handleLogout} className="rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50">Log out</button>
              <button
                onClick={() => setShowBooking(true)}
                className="rounded-xl bg-[#172541] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#253a60]"
              >
                + New rental
              </button>
            </div>
          </header>

          <div className="space-y-6 p-5 sm:p-8">
            {notice && (
              <div className="flex items-center justify-between rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-sm text-cyan-900">
                {notice}
                <button
                  onClick={() => setNotice("")}
                  className="ml-4 font-bold"
                  aria-label="Dismiss notice"
                >
                  ×
                </button>
              </div>
            )}

            {activeTab === "Overview" && (
              <>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">
                      Today at a glance
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                      A quick look at your rental operations.
                    </p>
                  </div>
                  <p className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-500">
{currentDate || "Loading date..."} · Database data
                  </p>
                </div>

                {dashboardError && (
                  <div
                    role="alert"
                    className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                  >
                    <p className="font-semibold">
                      Could not load database data.
                    </p>
                    <p className="mt-1">{dashboardError}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-3 rounded-lg border border-red-300 px-3 py-2 font-medium hover:bg-red-100"
                    >
                      Retry
                    </button>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {stats.map((stat) => (
                    <div
                      key={stat.label}
                      className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between">
                        <p className="text-sm text-slate-500">
                          {stat.label}
                        </p>
                        <span
                          className={`flex h-10 w-10 items-center justify-center rounded-xl text-lg font-bold ${stat.color}`}
                        >
                          {stat.icon}
                        </span>
                      </div>
                      <p className="mt-4 text-3xl font-bold tracking-tight text-slate-900">
                        {dashboardLoading
                          ? "..."
                          : stat.value ?? "Unavailable"}
                      </p>
                      <p className="mt-2 text-xs text-slate-400">
                        {stat.change}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="grid gap-6 xl:grid-cols-3">
                  <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm xl:col-span-2">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h2 className="font-bold text-slate-900">Fleet utilization</h2>
                        <p className="mt-1 text-sm text-slate-500">
                          Calculated from current MySQL rental records
                        </p>
                      </div>
                      <span className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-bold text-blue-700">
                        {dashboardLoading ? "..." : dashboardError || !dashboardData ? "Unavailable" : `${dashboardData.fleetStatus.utilizationPercent}% utilized`}
                      </span>
                    </div>

                    {dashboardLoading ? (
                      <p className="mt-7 text-sm text-slate-500">Loading fleet data...</p>
                    ) : dashboardError || !dashboardData ? (
                      <p className="mt-7 text-sm text-red-600">Fleet utilization could not be loaded.</p>
                    ) : dashboardData.totalVehicles === 0 ? (
                      <p className="mt-7 text-sm text-slate-500">No vehicles are registered in MySQL yet.</p>
                    ) : (
                      <>
                        <div className="mt-7 h-4 overflow-hidden rounded-full bg-slate-100">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-blue-700 to-cyan-400 transition-all"
                            style={{ width: `${Math.min(100, Math.max(0, dashboardData.fleetStatus.utilizationPercent))}%` }}
                          />
                        </div>
                        <div className="mt-4 flex flex-wrap justify-between gap-2 text-sm text-slate-500">
                          <span>{dashboardData.fleetStatus.currentlyRented} currently rented</span>
                          <span>{dashboardData.totalVehicles} total vehicles</span>
                        </div>
                        <p className="mt-4 text-xs text-slate-400">
                          Based on rental dates including today. Historical hourly utilization is not stored.
                        </p>
                      </>
                    )}
                  </div>

                  <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm">
                    <h2 className="font-bold text-slate-900">Fleet status</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Derived from current rental dates
                    </p>

                    <div className="mt-6 space-y-5">
                      {[
                        {
                          label: "Currently rented",
                          value: dashboardData?.fleetStatus.currentlyRented ?? 0,
                          color: "bg-blue-500",
                        },
                        {
                          label: "Not currently rented",
                          value: dashboardData?.fleetStatus.notCurrentlyRented ?? 0,
                          color: "bg-emerald-500",
                        },
                      ].map((item) => {
                        const total = dashboardData?.totalVehicles ?? 0;
                        const width = total > 0 ? Math.round((item.value / total) * 100) : 0;

                        return (
                          <div key={item.label}>
                            <div className="mb-2 flex justify-between text-sm">
                              <span className="text-slate-600">{item.label}</span>
                              <span className="font-semibold">
                                {dashboardLoading ? "..." : dashboardError ? "—" : item.value}
                              </span>
                            </div>
                            <div className="h-2 rounded-full bg-slate-100">
                              <div
                                className={`h-2 rounded-full ${item.color}`}
                                style={{ width: `${dashboardLoading || dashboardError ? 0 : width}%` }}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <p className="mt-5 text-xs text-slate-400">
                      Maintenance status is not available in the current Vehicle schema.
                    </p>
                    <button
                      onClick={() => changeTab("Vehicles")}
                      className="mt-5 w-full rounded-xl border border-slate-200 py-3 text-sm font-semibold hover:bg-slate-50"
                    >
                      View fleet →
                    </button>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200/80 bg-white shadow-sm">
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-6">
                    <div>
                      <h2 className="font-bold text-slate-900">Recent rentals</h2>
                      <p className="mt-1 text-sm text-slate-500">Latest booking activity · MySQL records</p>
                    </div>
                    <button onClick={() => changeTab("Rentals")} className="text-sm font-semibold text-blue-700 hover:text-blue-900">All rentals →</button>
                  </div>
                  {rentalsLoading && <p className="p-6 text-sm text-slate-500">Loading recent rentals from MySQL...</p>}
                  {rentalsError && <p role="alert" className="m-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{rentalsError}</p>}
                  {!rentalsLoading && !rentalsError && <div className="overflow-x-auto">
                    <table className="w-full min-w-[650px] text-left text-sm">
                      <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400"><tr><th className="px-6 py-4">Rental</th><th className="px-6 py-4">Customer</th><th className="px-6 py-4">Vehicle</th><th className="px-6 py-4">Dates</th><th className="px-6 py-4">Distance</th></tr></thead>
                      <tbody>
                        {dbRentals.slice(0, 3).map((r) => <tr key={r.Rental_ID} className="border-t border-slate-100">
                          <td className="px-6 py-4 font-semibold">#{r.Rental_ID}</td>
                          <td className="px-6 py-4">{[r.First_Name, r.Last_Name].filter(Boolean).join(" ") || `Customer ${r.Customer_ID}`}</td>
                          <td className="px-6 py-4">{r.Model || `Vehicle ${r.Vehicle_ID}`}<p className="text-xs text-slate-400">{r.Registration_No || ""}</p></td>
                          <td className="px-6 py-4">{String(r.Start_Date ?? "").slice(0, 10)} – {r.End_Date ? String(r.End_Date).slice(0, 10) : "Open"}</td>
                          <td className="px-6 py-4">{Number(r.Total_Distance ?? 0).toLocaleString("en-IN")} km</td>
                        </tr>)}
                        {dbRentals.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No rental records found in MySQL.</td></tr>}
                      </tbody>
                    </table>
                  </div>}
                </div>
              </>
            )}

            {activeTab === "Vehicles" && (
              <div className="space-y-5">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    Vehicle fleet
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Vehicle records loaded directly from your MySQL database.
                  </p>
                </div>

                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search registration, model, type, fuel, branch..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-400 sm:max-w-md"
                />

                {vehiclesLoading && (
                  <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
                    Loading vehicles from MySQL...
                  </p>
                )}

                {vehiclesError && (
                  <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                    <p className="font-semibold">Could not load vehicles.</p>
                    <p className="mt-1">{vehiclesError}</p>
                    <button
                      onClick={() => window.location.reload()}
                      className="mt-3 rounded-lg border border-red-300 px-3 py-2 font-medium hover:bg-red-100"
                    >
                      Retry
                    </button>
                  </div>
                )}

                {!vehiclesLoading && !vehiclesError && (
                  <div className="grid gap-4 md:grid-cols-2 2xl:grid-cols-3">
                    {filteredDbVehicles.map((v) => (
                      <div
                        key={v.Vehicle_ID}
                        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-xs font-medium text-slate-400">
                              {v.Registration_No}
                            </p>
                            <h3 className="mt-1 text-lg font-bold text-slate-900">
                              {v.Model}
                            </h3>
                            <p className="text-sm text-slate-500">
                              {v.Type ?? "Type not specified"}
                              {v.Year ? ` · ${v.Year}` : ""}
                            </p>
                          </div>
                          <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                            Registered
                          </span>
                        </div>

                        <div className="mt-5 space-y-3 border-t border-slate-100 pt-4 text-sm">
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-slate-500">Vehicle ID</span>
                            <span className="font-medium">{v.Vehicle_ID}</span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-slate-500">Fuel type</span>
                            <span className="font-medium">{v.Fuel_Type ?? "Not specified"}</span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-slate-500">Branch ID</span>
                            <span className="font-medium">{v.Branch_ID}</span>
                          </div>
                          <div className="border-t border-slate-100 pt-3">
                            <p className="text-xs text-slate-400">Base rate</p>
                            <p className="mt-1 text-lg font-bold text-slate-900">
                              ₹{Number(v.Base_Rate).toLocaleString("en-IN")}
                              <span className="text-xs font-normal text-slate-400"> /day</span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}

                    {filteredDbVehicles.length === 0 && (
                      <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500">
                        {dbVehicles.length === 0
                          ? "No vehicle records were returned by MySQL."
                          : "No vehicles match that search."}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === "Rentals" && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-6">
                  <div><h2 className="font-bold text-slate-900">Rental bookings</h2><p className="mt-1 text-sm text-slate-500">Rental records loaded from MySQL.</p></div>
                  <button onClick={() => void loadRentals()} className="rounded-lg border px-3 py-2 text-sm font-semibold">Refresh</button>
                </div>
                {rentalsLoading && <p className="p-6 text-sm text-slate-500">Loading rentals...</p>}
                {rentalsError && <p role="alert" className="m-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{rentalsError}</p>}
                {!rentalsLoading && !rentalsError && <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400"><tr><th className="px-6 py-4">Rental ID</th><th className="px-6 py-4">Customer</th><th className="px-6 py-4">Vehicle</th><th className="px-6 py-4">Dates</th><th className="px-6 py-4">Distance</th><th className="px-6 py-4">Status</th></tr></thead>
                  <tbody>{dbRentals.map((r) => <tr key={r.Rental_ID} className="border-t border-slate-100"><td className="px-6 py-4 font-semibold">#{r.Rental_ID}</td><td className="px-6 py-4">{[r.First_Name, r.Last_Name].filter(Boolean).join(" ") || `Customer ${r.Customer_ID}`}</td><td className="px-6 py-4">{r.Model || `Vehicle ${r.Vehicle_ID}`}<p className="text-xs text-slate-400">{r.Registration_No || ""}</p></td><td className="px-6 py-4">{String(r.Start_Date).slice(0,10)} – {r.End_Date ? String(r.End_Date).slice(0,10) : "Open"}</td><td className="px-6 py-4">{r.Total_Distance ?? 0} km</td><td className="px-6 py-4"><span className={`rounded-full px-3 py-1 text-xs font-medium ${
  new Date(String(r.Start_Date).slice(0, 10) + "T00:00:00") > new Date()
    ? "bg-violet-50 text-violet-700"
    : r.End_Date && new Date(String(r.End_Date).slice(0, 10) + "T23:59:59") < new Date()
      ? "bg-slate-100 text-slate-600"
      : "bg-emerald-50 text-emerald-700"
}`}>{new Date(String(r.Start_Date).slice(0, 10) + "T00:00:00") > new Date()
  ? "Upcoming"
  : r.End_Date && new Date(String(r.End_Date).slice(0, 10) + "T23:59:59") < new Date()
    ? "Completed"
    : "Active"}</span></td></tr>)}
                  {dbRentals.length === 0 && <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">No rental records found.</td></tr>}</tbody>
                </table></div>}
              </div>
            )}

            {activeTab === "Telemetry" && (
              <div className="space-y-5">
                <div className="flex flex-wrap items-center justify-between gap-3"><div><h2 className="text-lg font-bold text-slate-900">Vehicle telemetry</h2><p className="mt-1 text-sm text-slate-500">Telemetry documents retrieved from MongoDB through the API.</p></div><button onClick={() => void loadTelemetry()} className="rounded-lg border bg-white px-3 py-2 text-sm font-semibold">Refresh</button></div>
                {telemetryLoading && <p className="rounded-xl border bg-white p-4 text-sm text-slate-500">Loading telemetry...</p>}
                {telemetryError && <p role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">{telemetryError} Ensure `/api/telemetry` is connected to MongoDB.</p>}
                {!telemetryLoading && !telemetryError && <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm"><table className="w-full min-w-[650px] text-left text-sm"><thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400"><tr><th className="px-6 py-4">Vehicle / Device</th><th className="px-6 py-4">Location</th><th className="px-6 py-4">Speed</th><th className="px-6 py-4">Fuel</th><th className="px-6 py-4">Timestamp</th></tr></thead><tbody>{telemetry.map((t, i) => <tr key={t._id || i} className="border-t border-slate-100"><td className="px-6 py-4 font-semibold">{t.vehicle_id ?? t.Vehicle_ID ?? t.vehicleId ?? t.device_id ?? t.Device_ID ?? t.deviceId ?? "—"}</td><td className="px-6 py-4">
  {typeof t.location === "object" && t.location !== null
    ? (
        t.location.label ??
        t.location.area ??
        t.location.city ??
        t.location.address ??
        (
          (t.location.latitude ?? t.location.lat) &&
          (t.location.longitude ?? t.location.lng)
            ? `${t.location.latitude ?? t.location.lat}, ${t.location.longitude ?? t.location.lng}`
            : "Unknown location"
        )
      )
    : (t.GPS_Location ?? t.location ?? "—")}
</td><td className="px-6 py-4">{t.speed_kmph ?? t.Speed ?? t.speed ?? "—"} km/h</td><td className="px-6 py-4">{
  t.fuel_level ??
  t.fuel_level_percent ??
  t.Fuel_Level ??
  t.fuelLevel ??
  "—"
}%</td><td className="px-6 py-4">{(t.timestamp ?? t.TimeStamp) ? new Date(t.timestamp ?? t.TimeStamp).toLocaleString("en-IN") : "—"}</td></tr>)}{telemetry.length === 0 && <tr><td colSpan={5} className="px-6 py-8 text-center text-slate-500">No telemetry documents returned.</td></tr>}</tbody></table></div>}
              </div>
            )}

            {activeTab === "Billing" && (
              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-6"><div><h2 className="font-bold text-slate-900">Billing &amp; payments</h2><p className="mt-1 text-sm text-slate-500">Invoice records loaded from MySQL.</p></div><button onClick={() => void loadBills()} className="rounded-lg border px-3 py-2 text-sm font-semibold">Refresh</button></div>
                {billsLoading && <p className="p-6 text-sm text-slate-500">Loading bills...</p>}
                {billsError && <p role="alert" className="m-6 rounded-xl bg-red-50 p-4 text-sm text-red-700">{billsError} Ensure the /api/billing route is configured.</p>}
                {!billsLoading && !billsError && (
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[760px] text-left text-sm">
                      <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                        <tr>
                          <th className="px-6 py-4">Bill ID</th>
                          <th className="px-6 py-4">Rental ID</th>
                          <th className="px-6 py-4">Total amount</th>
                          <th className="px-6 py-4">Payment date</th>
                          <th className="px-6 py-4">Payment status</th>
                          <th className="px-6 py-4">Update payment</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dbBills.map((b) => {
                          const isPaid = String(b.Payment_Status ?? "").toLowerCase() === "paid";
                          const isUpdating = updatingBillId === Number(b.Bill_ID);
                          return (
                            <tr key={b.Bill_ID} className="border-t border-slate-100">
                              <td className="px-6 py-4 font-semibold">#{b.Bill_ID}</td>
                              <td className="px-6 py-4">#{b.Rental_ID}</td>
                              <td className="px-6 py-4 font-semibold">₹{Number(b.Total_Amount || 0).toLocaleString("en-IN")}</td>
                              <td className="px-6 py-4">{b.Payment_Date ? String(b.Payment_Date).slice(0, 10) : "—"}</td>
                              <td className="px-6 py-4">
                                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isPaid ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
                                  {b.Payment_Status || "Unknown"}
                                </span>
                              </td>
                              <td className="px-6 py-4">
                                <button
                                  type="button"
                                  disabled={isUpdating}
                                  onClick={() => void updateBill(Number(b.Bill_ID), isPaid ? "Pending" : "Paid")}
                                  className={`rounded-lg px-3 py-2 text-xs font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${isPaid ? "border border-amber-200 text-amber-700 hover:bg-amber-50" : "bg-emerald-600 text-white hover:bg-emerald-700"}`}
                                >
                                  {isUpdating ? "Updating..." : isPaid ? "Mark Unpaid" : "Mark Paid"}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                        {dbBills.length === 0 && (
                          <tr><td colSpan={6} className="px-6 py-8 text-center text-slate-500">No bill records found.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            <footer className="flex flex-wrap items-center justify-between gap-2 py-2 text-xs text-slate-400">
              <span>ROADWISE · Smart fleet operations</span>
              <span>
                Vehicles, rentals and billing: MySQL APIs · Telemetry: MongoDB API
              </span>
            </footer>
          </div>
        </section>
      </div>

      {showBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Create a rental
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Create a rental record in MySQL.
                </p>
              </div>
              <button
                onClick={() => setShowBooking(false)}
                className="rounded-lg px-3 py-1 text-xl text-slate-400 hover:bg-slate-100"
                aria-label="Close booking form"
              >
                x
              </button>
            </div>

            <form
              className="mt-5 space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                if (bookingSubmitting) return;
                setBookingSubmitting(true);
                const form = e.currentTarget;
                const values = new FormData(form);
                try {
                  const response = await fetch("/api/rentals", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      customerId: Number(values.get("customerId")),
                      vehicleId: Number(values.get("vehicleId")),
                      startDate: values.get("startDate"),
                      endDate: values.get("endDate"),
                      pickupLocation: values.get("pickupLocation"),
                      dropLocation: values.get("dropLocation"),
                    }),
                  });
                  const result = await response.json();
                  if (!response.ok || !result.success) {
                    setNotice(result.error || "Could not create rental.");
                    return;
                  }
                  setNotice(`Rental #${result.rentalId} saved successfully in MySQL.`);
                  setShowBooking(false);
                  setActiveTab("Rentals");
                  await loadRentals();
                  form.reset();
                } catch {
                  setNotice("Could not connect to the rentals API.");
                } finally {
                  setBookingSubmitting(false);
                }
              }}
            >
              <div>
  <div className="flex items-center justify-between">
    <label className="block text-sm font-medium text-slate-700">
      Customer
    </label>

    <button
      type="button"
      onClick={() => setShowAddCustomer(true)}
      className="text-sm font-medium text-blue-600 hover:text-blue-800"
    >
      + Add Customer
    </button>
  </div>

  <select
    name="customerId"
    required
    defaultValue=""
    className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3"
  >
    <option value="" disabled>
      Select a customer
    </option>

    {customers.map((customer) => (
      <option
        key={customer.Customer_ID}
        value={customer.Customer_ID}
      >
        {customer.First_Name} {customer.Last_Name}
      </option>
    ))}
  </select>
</div>
              <label className="block text-sm font-medium text-slate-700">Vehicle
                <select name="vehicleId" required defaultValue="" className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-3 font-normal">
                  <option value="" disabled>Select a vehicle</option>
                  {dbVehicles.map((v) => <option key={v.Vehicle_ID} value={v.Vehicle_ID}>{v.Model} — {v.Registration_No} (ID: {v.Vehicle_ID})</option>)}
                </select>
              </label>
              <label className="block text-sm font-medium text-slate-700">Start date
                <input name="startDate" type="date" required className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal" />
              </label>
              <label className="block text-sm font-medium text-slate-700">End date
                <input name="endDate" type="date" required className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal" />
              </label>
              <label className="block text-sm font-medium text-slate-700">Pickup location
                <input name="pickupLocation" required maxLength={50} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal" placeholder="Electronic City" />
              </label>
              <label className="block text-sm font-medium text-slate-700">Drop location
                <input name="dropLocation" required maxLength={50} className="mt-2 w-full rounded-xl border border-slate-200 px-3 py-3 font-normal" placeholder="Whitefield" />
              </label>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowBooking(false)} className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-semibold">Cancel</button>
                <button type="submit" disabled={bookingSubmitting} className="flex-1 rounded-xl bg-[#172541] py-3 text-sm font-semibold text-white disabled:opacity-60">{bookingSubmitting ? "Saving..." : "Save rental"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showAddCustomer && (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Add Customer</h2>

        <button
          type="button"
          onClick={() => setShowAddCustomer(false)}
          className="text-xl"
        >
          ×
        </button>
      </div>

      <form
  className="mt-6 space-y-4"
  onSubmit={async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/customers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
  licenseNo: newCustomer.licenseNo,
  firstName: newCustomer.firstName,
  lastName: newCustomer.lastName,
  email: newCustomer.email,
}),
      });

      if (!response.ok) {
        alert("Failed to add customer");
        return;
      }

      const createdCustomer = await response.json();
      setCustomers((prev) => [...prev, createdCustomer]);

setShowAddCustomer(false);

setNewCustomer({
  licenseNo: "",
  firstName: "",
  lastName: "",
  email: "",
});
    } catch (err) {
      console.error(err);
      alert("Error adding customer");
    }
  }}
>
        <input
  placeholder="First Name"
  value={newCustomer.firstName}
  onChange={(e) =>
    setNewCustomer({ ...newCustomer, firstName: e.target.value })
  }
  className="w-full rounded-xl border px-3 py-3"
/>

        <input
  placeholder="Last Name"
  value={newCustomer.lastName}
  onChange={(e) =>
    setNewCustomer({ ...newCustomer, lastName: e.target.value })
  }
  className="w-full rounded-xl border px-3 py-3"
/>

        <input
  placeholder="Email"
  value={newCustomer.email}
  onChange={(e) =>
    setNewCustomer({ ...newCustomer, email: e.target.value })
  }
  className="w-full rounded-xl border px-3 py-3"
/>

        <input
  placeholder="License Number"
  value={newCustomer.licenseNo}
  onChange={(e) =>
    setNewCustomer({ ...newCustomer, licenseNo: e.target.value })
  }
  className="w-full rounded-xl border px-3 py-3"
/>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowAddCustomer(false)}
            className="flex-1 rounded-xl border py-3"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="flex-1 rounded-xl bg-[#172541] py-3 text-white"
          >
            Add Customer
          </button>
        </div>
      </form>
    </div>
  </div>
)}
    </main>
  );
}
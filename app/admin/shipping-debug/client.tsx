"use client";

import { useState } from "react";

export default function ShippingDebugClient({
  tokenStatus,
  tokenError,
  recentLogs,
  failedOrders,
  config
}: {
  tokenStatus: string;
  tokenError: string | null;
  recentLogs: any[];
  failedOrders: any[];
  config: any;
}) {
  const [testOrderNumber, setTestOrderNumber] = useState("");
  const [testResult, setTestResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const runTest = async () => {
    if (!testOrderNumber) return alert("Enter an order number to test");
    setLoading(true);
    setTestResult(null);
    try {
      const res = await fetch(`/api/debug/shiprocket?orderNumber=${testOrderNumber}`);
      const data = await res.json();
      setTestResult(data);
    } catch (e: any) {
      setTestResult({ error: e.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Configuration Status */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-xl font-bold mb-4">Shiprocket Configuration</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="font-medium text-gray-700">API Email</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.emailSet ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {config.emailSet ? "Configured" : "Missing"}
            </span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="font-medium text-gray-700">API Password</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.passwordSet ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {config.passwordSet ? "Configured" : "Missing"}
            </span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="font-medium text-gray-700">Webhook Secret</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.webhookSecretSet ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'}`}>
              {config.webhookSecretSet ? "Configured" : "Not Set (Optional)"}
            </span>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <span className="font-medium text-gray-700">Authentication Token</span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${tokenStatus === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
              {tokenStatus}
            </span>
          </div>
        </div>
        {tokenError && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-lg text-sm font-mono">
            Error: {tokenError}
          </div>
        )}
      </div>

      {/* Debug Endpoint Tester */}
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h2 className="text-xl font-bold mb-4">Run Isolated Shipment Test</h2>
        <p className="text-gray-600 mb-4 text-sm">
          Run the full Shiprocket orchestration pipeline synchronously for a specific order. This is for debugging only.
        </p>
        <div className="flex gap-4 mb-4">
          <input 
            type="text" 
            placeholder="Order Number (e.g. ORD-12345)"
            value={testOrderNumber}
            onChange={(e) => setTestOrderNumber(e.target.value)}
            className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-sky-500"
          />
          <button 
            onClick={runTest}
            disabled={loading}
            className="px-6 py-2 bg-sky-600 text-white font-medium rounded-lg hover:bg-sky-700 disabled:opacity-50"
          >
            {loading ? "Running..." : "Run Test"}
          </button>
        </div>
        {testResult && (
          <div className="mt-4 bg-gray-900 text-green-400 p-4 rounded-lg overflow-x-auto">
            <pre className="text-sm whitespace-pre-wrap">{JSON.stringify(testResult, null, 2)}</pre>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Failed Orders */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
          <h2 className="text-xl font-bold mb-4 text-red-600">Recent Failed Shipments</h2>
          {failedOrders.length === 0 ? (
            <p className="text-gray-500">No failed shipments found.</p>
          ) : (
            <div className="space-y-4">
              {failedOrders.map((order) => (
                <div key={order.id} className="p-4 bg-red-50 rounded-lg border border-red-100">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-bold text-red-800">{order.orderNumber}</span>
                    <span className="text-sm text-red-600">Retries: {order.shipmentRetryCount}</span>
                  </div>
                  <p className="text-sm text-gray-700">Payment: {order.paymentStatus}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Shipment Logs */}
        <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
          <h2 className="text-xl font-bold mb-4">Global Shipment Event Log</h2>
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {recentLogs.map((log) => (
              <div key={log.id} className="p-3 border rounded-lg bg-gray-50 text-sm">
                <div className="flex justify-between mb-1">
                  <span className="font-semibold text-sky-700">{log.order?.orderNumber || log.orderId}</span>
                  <span className="text-gray-500 text-xs">{new Date(log.createdAt).toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2 mb-2">
                  <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                    log.status === 'SUCCESS' ? 'bg-green-100 text-green-700' :
                    log.status === 'FAILED' ? 'bg-red-100 text-red-700' :
                    'bg-gray-200 text-gray-700'
                  }`}>
                    {log.status}
                  </span>
                  <span className="font-medium text-gray-800">{log.action}</span>
                </div>
                {log.error && (
                  <div className="mt-2 p-2 bg-red-50 text-red-600 rounded text-xs font-mono overflow-x-auto">
                    {log.error}
                  </div>
                )}
                {log.details && (
                  <details className="mt-2">
                    <summary className="text-xs text-gray-500 cursor-pointer hover:text-gray-700">View Details</summary>
                    <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto text-gray-700">
                      {JSON.stringify(log.details, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

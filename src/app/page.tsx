export default function Home() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Welcome</h1>
      <p className="text-slate-600 max-w-2xl">
        This is the Last-Mile Delivery Tracker: customers place orders with auto-calculated,
        zone-based pricing; admins manage zones, rate cards, and agents; delivery agents update
        status in real time. Log in to get started based on your role.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
        <div className="border rounded-lg p-4 bg-white">
          <h2 className="font-semibold mb-1">Customers</h2>
          <p className="text-slate-600">Place an order, see the price before you confirm, and track it live.</p>
        </div>
        <div className="border rounded-lg p-4 bg-white">
          <h2 className="font-semibold mb-1">Delivery Agents</h2>
          <p className="text-slate-600">See assigned orders and update pickup/transit/delivery status.</p>
        </div>
        <div className="border rounded-lg p-4 bg-white">
          <h2 className="font-semibold mb-1">Admins</h2>
          <p className="text-slate-600">Configure zones, rate cards, COD surcharge, and oversee every order.</p>
        </div>
      </div>
    </div>
  );
}

export default function AppLayout({ sidebar, children }) {
  return (
    <div className="app">
      {sidebar}

      <main>{children}</main>
    </div>
  );
}
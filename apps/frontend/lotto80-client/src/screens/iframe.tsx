export default function IframPage() {
  return (
    <div className="w-full mx-auto min-h-svh">
      <iframe
        src="http://localhost:4200?token=testtoken123"
        title="Lotto 80"
        className="w-full h-screen border-0"
      ></iframe>
    </div>
  );
}

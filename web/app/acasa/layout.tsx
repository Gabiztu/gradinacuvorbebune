export default function AcasaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen font-inter">
      {children}
    </div>
  )
}

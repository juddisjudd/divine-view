interface ResourceSectionProps {
  title: string;
  children: React.ReactNode;
}

export function ResourceSection({ title, children }: ResourceSectionProps) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-bold text-[#ffd700] mb-4">{title}</h2>
      <div className="grid gap-4 md:grid-cols-2">{children}</div>
    </section>
  );
}

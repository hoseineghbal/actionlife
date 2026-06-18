import Link from "next/link";

interface SectionCardProps {
  title: string;
  description: string;
  href: string;
  icon: string;
  color: string;
}

export default function SectionCard({
  title,
  description,
  href,
  icon,
  color,
}: SectionCardProps) {
  return (
    <Link
      href={href}
      className="section-card block bg-dark-light border border-white/10 rounded-xl p-6 hover:border-primary/30"
    >
      <div
        className="w-14 h-14 rounded-xl flex items-center justify-center text-2xl mb-4"
        style={{ backgroundColor: `${color}20`, color }}
      >
        {icon}
      </div>
      <h3 className="text-white font-bold text-lg mb-2">{title}</h3>
      <p className="text-gray-custom text-sm leading-6">{description}</p>
    </Link>
  );
}

import { Package, ShoppingCart, Users, Ticket, ScrollText, FileText } from "lucide-react";

type IconName = "package" | "cart" | "users" | "ticket" | "scroll" | "file";

const ICONS: Record<IconName, React.ElementType> = {
  package: Package,
  cart: ShoppingCart,
  users: Users,
  ticket: Ticket,
  scroll: ScrollText,
  file: FileText,
};

type AdminEmptyStateProps = {
  icon?: IconName;
  title: string;
  description?: string;
};

export default function AdminEmptyState({ icon = "file", title, description }: AdminEmptyStateProps) {
  const Icon = ICONS[icon];
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-12 h-12 rounded-full bg-zinc-100 flex items-center justify-center mb-3">
        <Icon className="h-6 w-6 text-zinc-400" />
      </div>
      <div className="text-sm font-medium text-zinc-500">{title}</div>
      {description && (
        <div className="text-xs text-zinc-400 mt-1 max-w-xs">{description}</div>
      )}
    </div>
  );
}

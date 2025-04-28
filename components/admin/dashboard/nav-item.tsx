"use client";

interface NavItemProps {
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem = ({ icon, label, isActive, onClick }: NavItemProps) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full px-3 py-2 rounded-lg transition-colors ${
      isActive
        ? 'sidebar-primary'
        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
    }`}
  >
    {icon}
    <span className="ml-3">{label}</span>
  </button>
);

export default NavItem;
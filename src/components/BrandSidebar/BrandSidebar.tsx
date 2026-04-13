import { ChevronDown, ChevronRight, Lock } from 'lucide-react';
import type { NavSection } from './sidebarConfig';

type Props = {
  title?: string;
  sections: NavSection[];
  activeMenu: string;
  onNavigate: (id: string) => void;
  /** Controls the expand/collapse state of all parent items that have children */
  parentExpanded?: boolean;
  onParentToggle?: () => void;
};

export default function BrandSidebar({
  title = 'Brand Settings',
  sections,
  activeMenu,
  onNavigate,
  parentExpanded = true,
  onParentToggle,
}: Props) {
  return (
    <div className="w-64 border-r border-neutral-800/40 flex flex-col p-4 shrink-0">
      <h2 className="text-white text-lg font-medium mb-6 px-2 mt-2">{title}</h2>

      <div className="space-y-1">
        {sections.map((section) =>
          section.items.map((item) => {
            const Icon = item.icon;
            const hasChildren = item.children && item.children.length > 0;

            if (hasChildren) {
              // Parent item — click toggles children visibility
              return (
                <div key={item.id} className="pt-2">
                  <button
                    onClick={onParentToggle}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-light transition-colors ${
                      activeMenu === item.id
                        ? 'bg-neutral-900/50 text-white'
                        : 'text-neutral-400 hover:text-white hover:bg-neutral-900/30'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {Icon && <Icon size={16} />} {item.label}
                    </div>
                    {parentExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>

                  {/* Children */}
                  {parentExpanded && (
                    <div className="ml-5 mt-1 border-l border-neutral-800/50 flex flex-col pl-2 space-y-1">
                      {item.children!.map((child) => {
                        const ChildIcon = child.icon;
                        return (
                          <button
                            key={child.id}
                            onClick={() => onNavigate(child.id)}
                            className={`text-left px-3 py-1.5 rounded-md text-sm font-light transition-colors flex items-center justify-between ${
                              activeMenu === child.id
                                ? 'bg-neutral-900/50 text-white'
                                : 'text-neutral-500 hover:text-neutral-300'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              {ChildIcon && <ChildIcon size={14} />}
                              {child.label}
                            </span>
                            {child.locked && <Lock size={10} className="text-neutral-600 shrink-0" />}
                            {child.badge != null && (
                              <span className="text-[10px] font-mono text-neutral-600 shrink-0">
                                {child.badge}
                              </span>
                            )}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            // Flat item
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-light transition-colors ${
                  activeMenu === item.id
                    ? 'bg-neutral-900/50 text-white'
                    : 'text-neutral-400 hover:text-white hover:bg-neutral-900/30'
                }`}
              >
                {Icon && <Icon size={16} />} {item.label}
                {item.locked && <Lock size={10} className="text-neutral-600 ml-auto" />}
              </button>
            );
          })
        )}
      </div>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-neutral-800/30">
        <span className="text-[10px] text-neutral-700 font-mono tracking-widest px-2">frndOS v4.2</span>
      </div>
    </div>
  );
}

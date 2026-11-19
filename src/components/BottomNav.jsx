import { Play, Brain, Backpack, ShoppingCart, Database } from 'lucide-react';

export const BottomNav = ({
  screen,
  onNavigate,
  claimableMilestones = 0,
  mistakeCount = 0,
  nemesisCount = 0
}) => {
  const tabs = [
    { id: 'menu', label: '出擊', icon: Play, activeColor: 'text-cyan-300', barColor: 'bg-cyan-400 shadow-[0_0_10px_#22d3ee]' },
    { id: 'codex', label: '圖鑑', icon: Brain, activeColor: 'text-emerald-300', barColor: 'bg-emerald-400 shadow-[0_0_10px_#34d399]' },
    { id: 'loadout', label: '裝備', icon: Backpack, activeColor: 'text-blue-300', barColor: 'bg-blue-400 shadow-[0_0_10px_#60a5fa]', badge: claimableMilestones > 0 ? '獎' : null, badgeColor: 'bg-amber-400 text-black' },
    { id: 'shop', label: '商城', icon: ShoppingCart, activeColor: 'text-yellow-300', barColor: 'bg-yellow-400 shadow-[0_0_10px_#facc15]' },
    { id: 'records', label: '日誌', icon: Database, activeColor: 'text-orange-300', barColor: 'bg-orange-400 shadow-[0_0_10px_#fb923c]', badge: mistakeCount > 0 ? mistakeCount : (nemesisCount > 0 ? '!' : null), badgeColor: 'bg-orange-500 text-black' }
  ];

  return (
    <nav className="shrink-0 bg-gray-950/95 border-t border-cyan-900/70 backdrop-blur-md grid grid-cols-5 z-30 pb-[env(safe-area-inset-bottom)]">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = screen === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onNavigate(tab.id)}
            className={`relative py-2.5 px-1 flex flex-col items-center justify-center gap-1 transition-all active:scale-95 ${
              isActive ? `${tab.activeColor} bg-gray-900/70` : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {isActive && (
              <span className={`absolute top-0 left-2 right-2 h-[2px] rounded-full ${tab.barColor}`} />
            )}
            <div className="relative">
              <Icon size={18} strokeWidth={isActive ? 2.5 : 2} />
              {tab.badge && (
                <span className={`absolute -top-1.5 -right-2.5 min-w-[16px] h-[16px] px-1 rounded-full text-[9px] font-black flex items-center justify-center ${tab.badgeColor}`}>
                  {tab.badge}
                </span>
              )}
            </div>
            <span className="text-[10px] font-black tracking-wide">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};

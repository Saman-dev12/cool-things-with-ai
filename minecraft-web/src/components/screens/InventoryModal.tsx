import React, { useState } from 'react';
import { BlockType, InventorySlot } from '../../types';
import { BLOCK_REGISTRY, CREATIVE_BLOCKS } from '../../voxel/BlockRegistry';
import { getBlockIconUrl } from '../../voxel/BlockIconHelper';
import { SoundManager } from '../../audio/SoundManager';
import { X, Search, Sparkles, Hammer } from 'lucide-react';

interface InventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  hotbar: InventorySlot[];
  onSetHotbarSlot: (slotIdx: number, block: BlockType, count: number) => void;
  activeSlotIndex: number;
}

export const InventoryModal: React.FC<InventoryModalProps> = ({
  isOpen,
  onClose,
  hotbar,
  onSetHotbarSlot,
  activeSlotIndex
}) => {
  const [activeTab, setActiveTab] = useState<'creative' | 'crafting'>('creative');
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<string>('all');

  // 2x2 Crafting State
  const [craftingGrid, setCraftingGrid] = useState<(BlockType | null)[]>([null, null, null, null]);

  if (!isOpen) return null;

  // Filter creative blocks
  const filteredBlocks = CREATIVE_BLOCKS.filter(b => {
    const def = BLOCK_REGISTRY[b];
    if (!def) return false;
    const matchesSearch = def.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = category === 'all' || def.category === category;
    return matchesSearch && matchesCategory;
  });

  // Simple 2x2 crafting recipe solver
  const getCraftingResult = (): { block: BlockType; count: number } | null => {
    const [c0, c1, c2, c3] = craftingGrid;

    // 1 Wood Log anywhere -> 4 Planks
    const woodCount = craftingGrid.filter(b => b === BlockType.OAK_LOG).length;
    if (woodCount === 1 && craftingGrid.filter(Boolean).length === 1) {
      return { block: BlockType.OAK_PLANKS, count: 4 };
    }

    // 4 Planks -> 1 Crafting Table
    if (c0 === BlockType.OAK_PLANKS && c1 === BlockType.OAK_PLANKS && c2 === BlockType.OAK_PLANKS && c3 === BlockType.OAK_PLANKS) {
      return { block: BlockType.CRAFTING_TABLE, count: 1 };
    }

    // 4 Cobblestone -> 1 Furnace
    if (c0 === BlockType.COBBLESTONE && c1 === BlockType.COBBLESTONE && c2 === BlockType.COBBLESTONE && c3 === BlockType.COBBLESTONE) {
      return { block: BlockType.FURNACE, count: 1 };
    }

    // 2 Sand + 2 Dirt -> 2 TNT
    if (c0 === BlockType.SAND && c1 === BlockType.DIRT && c2 === BlockType.DIRT && c3 === BlockType.SAND) {
      return { block: BlockType.TNT, count: 2 };
    }

    return null;
  };

  const craftResult = getCraftingResult();

  const handleEquipBlock = (block: BlockType) => {
    onSetHotbarSlot(activeSlotIndex, block, 64);
    SoundManager.getInstance().playClick();
  };

  const handleClaimCraft = () => {
    if (!craftResult) return;
    onSetHotbarSlot(activeSlotIndex, craftResult.block, craftResult.count);
    SoundManager.getInstance().playPop();
    setCraftingGrid([null, null, null, null]);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs select-none">
      <div className="bg-[#2c2c2c] border-4 border-[#181818] rounded-lg w-full max-w-xl shadow-2xl flex flex-col overflow-hidden text-white font-mono">
        {/* Top Header */}
        <div className="bg-[#1f1f1f] px-4 py-2.5 border-b-2 border-[#181818] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('creative')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs transition ${
                activeTab === 'creative' ? 'bg-[#444] text-white font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Creative Item Catalog</span>
            </button>
            <button
              onClick={() => setActiveTab('crafting')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs transition ${
                activeTab === 'crafting' ? 'bg-[#444] text-white font-bold' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Hammer className="w-3.5 h-3.5 text-cyan-400" />
              <span>2x2 Crafting</span>
            </button>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-zinc-400 hover:text-white hover:bg-[#333] rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Area */}
        {activeTab === 'creative' ? (
          <div className="p-4 space-y-3">
            {/* Search & Filter Bar */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search item or block..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-[#1e1e1e] border border-zinc-700 pl-8 pr-3 py-1.5 rounded text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Category Pills */}
              <div className="flex items-center gap-1 text-[11px]">
                {['all', 'building', 'natural', 'functional', 'ores'].map(cat => (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className={`px-2 py-1 rounded capitalize transition ${
                      category === cat ? 'bg-amber-500 text-black font-bold' : 'bg-[#1e1e1e] text-zinc-400 hover:text-white'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Block Grid */}
            <div className="grid grid-cols-8 gap-2 p-2 bg-[#1e1e1e] border-2 border-zinc-700 rounded max-h-60 overflow-y-auto">
              {filteredBlocks.map(block => {
                const def = BLOCK_REGISTRY[block];
                const iconUrl = getBlockIconUrl(block);

                return (
                  <button
                    key={block}
                    onClick={() => handleEquipBlock(block)}
                    className="relative group p-1.5 bg-[#2a2a2a] border border-zinc-700 hover:border-amber-400 hover:bg-[#383838] rounded flex flex-col items-center justify-center transition cursor-pointer"
                    title={`Equip ${def.name} into Active Slot (${activeSlotIndex + 1})`}
                  >
                    <img src={iconUrl} alt={def.name} className="w-8 h-8 pixelated pointer-events-none" />
                    <span className="text-[9px] text-zinc-400 truncate w-full text-center mt-1">
                      {def.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="p-6 flex flex-col items-center justify-center space-y-4">
            <div className="text-xs text-zinc-300 font-bold mb-1">2x2 Survival Crafting Table</div>
            <div className="flex items-center gap-6">
              {/* 2x2 Crafting Grid */}
              <div className="grid grid-cols-2 gap-1.5 p-2 bg-[#1e1e1e] border-2 border-zinc-700 rounded">
                {craftingGrid.map((block, idx) => {
                  const iconUrl = block ? getBlockIconUrl(block) : '';
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        // Place active block into grid
                        const next = [...craftingGrid];
                        next[idx] = next[idx] ? null : (hotbar[activeSlotIndex]?.block || BlockType.OAK_LOG);
                        setCraftingGrid(next);
                      }}
                      className="w-14 h-14 bg-[#2b2b2b] border border-zinc-700 hover:border-zinc-500 rounded flex items-center justify-center cursor-pointer"
                    >
                      {iconUrl ? (
                        <img src={iconUrl} alt="Item" className="w-10 h-10 pixelated" />
                      ) : (
                        <span className="text-zinc-600 text-[10px]">+</span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Crafting Arrow */}
              <div className="text-xl font-bold text-zinc-400">➜</div>

              {/* Output Slot */}
              <div className="flex flex-col items-center">
                <button
                  onClick={handleClaimCraft}
                  disabled={!craftResult}
                  className={`w-16 h-16 rounded border-2 flex items-center justify-center relative cursor-pointer ${
                    craftResult
                      ? 'bg-[#333] border-amber-400 shadow-lg scale-105'
                      : 'bg-[#1e1e1e] border-zinc-800 opacity-50 cursor-not-allowed'
                  }`}
                >
                  {craftResult && (
                    <>
                      <img
                        src={getBlockIconUrl(craftResult.block)}
                        alt="Result"
                        className="w-10 h-10 pixelated"
                      />
                      <span className="absolute bottom-1 right-1.5 text-xs font-bold text-white drop-shadow">
                        {craftResult.count}
                      </span>
                    </>
                  )}
                </button>
                <span className="text-[10px] text-zinc-400 mt-1">Output</span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-400 max-w-sm text-center">
              Recipes: 1 Wood Log = 4 Planks • 4 Planks = Crafting Table • 4 Cobblestone = Furnace • 2 Sand + 2 Dirt = TNT
            </p>
          </div>
        )}

        {/* Hotbar Sync Row at Bottom */}
        <div className="p-3 bg-[#1e1e1e] border-t-2 border-[#181818] flex flex-col items-center gap-1.5">
          <div className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
            Equipped Hotbar (Active Slot: #{activeSlotIndex + 1})
          </div>
          <div className="flex items-center gap-1">
            {hotbar.map((slot, idx) => {
              const isActive = idx === activeSlotIndex;
              const iconUrl = slot.block !== BlockType.AIR ? getBlockIconUrl(slot.block) : '';

              return (
                <div
                  key={idx}
                  className={`w-11 h-11 rounded flex items-center justify-center relative bg-[#2a2a2a] border ${
                    isActive ? 'border-amber-400 bg-[#383838]' : 'border-zinc-700'
                  }`}
                >
                  <span className="absolute top-0.5 left-1 text-[8px] text-zinc-500">{idx + 1}</span>
                  {iconUrl && (
                    <img src={iconUrl} alt="Item" className="w-7 h-7 pixelated" />
                  )}
                  {slot.count > 1 && (
                    <span className="absolute bottom-0.5 right-1 text-[10px] font-bold text-white">
                      {slot.count}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

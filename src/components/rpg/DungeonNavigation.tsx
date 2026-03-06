import { useGame } from '@/context/GameContext';
import { ROOMS } from '@/data/rooms';
import { ITEMS } from '@/data/items';
import { NPCS } from '@/data/npcs';
import { getModifier, rollDice } from '@/data/classes';
import { useCallback } from 'react';

const DungeonNavigation = () => {
  const { state, dispatch } = useGame();
  const currentRoom = ROOMS[state.currentRoomId];

  const handleEnterRoom = useCallback((roomId: string) => {
    const conn = currentRoom.connections.find(c => c.roomId === roomId);
    if (conn?.locked && conn.requiredItem) {
      const hasKey = state.inventory.includes(conn.requiredItem);
      if (!hasKey) {
        dispatch({ type: 'ADD_LOG', text: `🔒 The door is locked. You need: ${ITEMS[conn.requiredItem]?.name || conn.requiredItem}`, logType: 'system' });
        return;
      }
      dispatch({ type: 'ADD_LOG', text: `🔑 You use the ${ITEMS[conn.requiredItem]?.name} to unlock the door.`, logType: 'system' });
    }
    dispatch({ type: 'MOVE_ROOM', roomId });
  }, [state.currentRoomId, state.inventory, dispatch]);

  const handleEncounter = useCallback(() => {
    const enc = currentRoom.encounter;
    if (!enc || state.clearedEncounters.has(currentRoom.id)) return;

    switch (enc.type) {
      case 'combat':
        if (enc.enemyId) dispatch({ type: 'START_COMBAT', enemyId: enc.enemyId });
        break;
      case 'npc':
        if (enc.npcId) dispatch({ type: 'OPEN_DIALOGUE', npcId: enc.npcId });
        break;
      case 'loot':
        if (enc.lootId) {
          dispatch({ type: 'ADD_ITEM', itemId: enc.lootId });
          const cleared = new Set(state.clearedEncounters);
          cleared.add(currentRoom.id);
          // Mark as cleared via log
          dispatch({ type: 'ADD_LOG', text: `You search the room and find something useful.`, logType: 'narrative' });
        }
        break;
      case 'lore':
        if (enc.loreText) {
          dispatch({ type: 'ADD_LOG', text: `📖 ${enc.loreText}`, logType: 'narrative' });
          dispatch({ type: 'SET_FLAG', flag: `lore_${currentRoom.id}` });
        }
        break;
      case 'skillcheck':
        if (enc.skill && enc.dc) {
          const skillAbilityMap: Record<string, 'INT' | 'WIS' | 'CHA' | 'DEX' | 'STR'> = {
            Investigation: 'INT', Arcana: 'INT', History: 'INT',
            Perception: 'WIS', Insight: 'WIS', Medicine: 'WIS', Survival: 'WIS', Nature: 'INT',
            Stealth: 'DEX', Athletics: 'STR',
            Persuasion: 'CHA', Deception: 'CHA', Intimidation: 'CHA', Performance: 'CHA',
          };
          const ability = skillAbilityMap[enc.skill] || 'INT';
          const mod = getModifier(state.abilities[ability]) + (state.skills.includes(enc.skill) ? state.proficiencyBonus : 0);
          const roll = rollDice(20);

          dispatch({
            type: 'START_SKILL_CHECK',
            skill: enc.skill,
            dc: enc.dc,
            onSuccess: () => {
              if (enc.lootId) {
                dispatch({ type: 'ADD_ITEM', itemId: enc.lootId });
              }
            },
            onFail: () => {
              dispatch({ type: 'ADD_LOG', text: 'You find nothing of interest.', logType: 'narrative' });
            },
          });

          setTimeout(() => {
            dispatch({ type: 'RESOLVE_SKILL_CHECK', roll, modifier: mod });
          }, 500);
        }
        break;
    }
  }, [state.currentRoomId, state.clearedEncounters, state.abilities, state.skills, dispatch]);

  const encounterAvailable = currentRoom.encounter && !state.clearedEncounters.has(currentRoom.id) && !state.storyFlags.has(`lore_${currentRoom.id}`);

  // Build minimap
  const allRoomEntries = Object.values(ROOMS);
  const minX = Math.min(...allRoomEntries.map(r => r.x));
  const maxX = Math.max(...allRoomEntries.map(r => r.x));
  const minY = Math.min(...allRoomEntries.map(r => r.y));
  const maxY = Math.max(...allRoomEntries.map(r => r.y));

  return (
    <div className="flex-1 flex flex-col gap-3">
      {/* Room description */}
      <div className="rpg-panel-active">
        <h2 className="font-display font-bold text-primary rpg-glow text-lg mb-1">{currentRoom.name}</h2>
        <p className="encounter-text">{currentRoom.description}</p>

        {encounterAvailable && (
          <button
            onClick={handleEncounter}
            className="mt-3 action-btn-attack"
          >
            {currentRoom.encounter?.type === 'combat' && '⚔️ Engage'}
            {currentRoom.encounter?.type === 'npc' && '💬 Speak'}
            {currentRoom.encounter?.type === 'loot' && '🔍 Search'}
            {currentRoom.encounter?.type === 'lore' && '📖 Examine'}
            {currentRoom.encounter?.type === 'skillcheck' && `🎲 ${currentRoom.encounter.skill} Check (DC ${currentRoom.encounter.dc})`}
          </button>
        )}

        {state.clearedEncounters.has(currentRoom.id) && (
          <div className="mt-2 text-xs text-muted-foreground italic">This area has been cleared.</div>
        )}
      </div>

      {/* Map */}
      <div className="rpg-panel">
        <h3 className="rpg-label mb-2">Dungeon Map</h3>
        <div className="flex flex-col items-center gap-0.5">
          {Array.from({ length: maxY - minY + 1 }, (_, rowIdx) => {
            const y = minY + rowIdx;
            return (
              <div key={y} className="flex gap-0.5">
                {Array.from({ length: maxX - minX + 1 }, (_, colIdx) => {
                  const x = minX + colIdx;
                  const room = allRoomEntries.find(r => r.x === x && r.y === y);
                  const isCurrent = room?.id === state.currentRoomId;
                  const isVisited = room && state.visitedRooms.has(room.id);

                  if (!room) return <div key={x} className="w-8 h-8" />;

                  return (
                    <div
                      key={x}
                      className={isCurrent ? 'room-cell-current' : isVisited ? 'room-cell-visited' : 'room-cell-unknown'}
                      title={isVisited ? room.name : '???'}
                    >
                      {isCurrent ? '◆' : isVisited ? '·' : '?'}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="rpg-panel">
        <h3 className="rpg-label mb-2">Exits</h3>
        <div className="flex gap-2 flex-wrap">
          {currentRoom.connections.map(conn => {
            const targetRoom = ROOMS[conn.roomId];
            const isLocked = conn.locked && conn.requiredItem && !state.inventory.includes(conn.requiredItem);
            return (
              <button
                key={conn.roomId}
                onClick={() => handleEnterRoom(conn.roomId)}
                className={`action-btn-defend text-xs ${isLocked ? 'opacity-50' : ''}`}
              >
                {conn.direction}: {state.visitedRooms.has(conn.roomId) ? targetRoom.name : '???'}
                {isLocked && ' 🔒'}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DungeonNavigation;

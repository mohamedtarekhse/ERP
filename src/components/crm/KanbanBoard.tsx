import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useCRMPipelineStages, useCRMDeals, useUpdateDealStage } from '../../hooks/useCRM';
import type { CRMDeal } from '../../hooks/useCRM';
import { DealCard } from './DealCard';
import { useGlobalStore } from '../../store/globalStore';

export const KanbanBoard: React.FC = () => {
  const { data: stages, isLoading: stagesLoading } = useCRMPipelineStages();
  const { data: deals, isLoading: dealsLoading } = useCRMDeals();
  const updateDealStage = useUpdateDealStage();
  const { openObjectPage } = useGlobalStore();

  const [columns, setColumns] = useState<Record<string, CRMDeal[]>>({});

  useEffect(() => {
    if (stages && deals) {
      const newColumns: Record<string, CRMDeal[]> = {};
      stages.forEach(stage => {
        newColumns[stage.id] = deals.filter(deal => deal.stage_id === stage.id);
      });
      setColumns(newColumns);
    }
  }, [stages, deals]);

  const onDragEnd = (result: DropResult) => {
    const { source, destination, draggableId } = result;

    if (!destination) return;
    if (source.droppableId === destination.droppableId && source.index === destination.index) return;

    // Optimistic UI update
    const sourceColumn = [...columns[source.droppableId]];
    const destColumn = [...columns[destination.droppableId]];
    const [movedDeal] = sourceColumn.splice(source.index, 1);
    
    // Update stage ID for optimistic render
    movedDeal.stage_id = destination.droppableId;
    destColumn.splice(destination.index, 0, movedDeal);

    setColumns({
      ...columns,
      [source.droppableId]: sourceColumn,
      [destination.droppableId]: destColumn,
    });

    // Database update
    updateDealStage.mutate({
      dealId: draggableId,
      stageId: destination.droppableId
    });
  };

  if (stagesLoading || dealsLoading) return <div className="loading-state">Loading Pipeline...</div>;

  return (
    <div className="kanban-container" style={{ display: 'flex', gap: '16px', overflowX: 'auto', padding: '20px', minHeight: '600px' }}>
      <DragDropContext onDragEnd={onDragEnd}>
        {stages?.map(stage => (
          <div key={stage.id} className="kanban-column" style={{ minWidth: '300px', background: 'var(--frappe-bg-light)', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column' }}>
            <div className="kanban-column-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px', padding: '0 4px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: 600, color: 'var(--frappe-text)' }}>{stage.name}</h3>
              <span className="kanban-count" style={{ background: 'var(--frappe-border)', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 500 }}>
                {columns[stage.id]?.length || 0}
              </span>
            </div>
            
            <Droppable droppableId={stage.id}>
              {(provided: any, snapshot: any) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{
                    flexGrow: 1,
                    minHeight: '100px',
                    transition: 'background-color 0.2s ease',
                    backgroundColor: snapshot.isDraggingOver ? 'var(--frappe-gray-100)' : 'transparent',
                    borderRadius: '4px'
                  }}
                >
                  {columns[stage.id]?.map((deal, index) => (
                    <Draggable key={deal.id} draggableId={deal.id} index={index}>
                      {(provided: any, snapshot: any) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          style={{
                            ...provided.draggableProps.style,
                            marginBottom: '10px'
                          }}
                          onClick={() => openObjectPage('Deal', deal.id)}
                        >
                          <DealCard deal={deal} isDragging={snapshot.isDragging} />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </DragDropContext>
    </div>
  );
};

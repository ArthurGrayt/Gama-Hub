import React, { type CSSProperties } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import AppCard from './AppCard';

interface SortableAppCardProps {
    id: number;
    app: any;
    isEditMode: boolean;
    onEdit: (app: any) => void;
    onDelete: (id: number) => void;
    iconNode: React.ReactNode;
    fixed?: boolean;
    onToggleFixed?: () => void;
}

export function SortableAppCard({ id, app, isEditMode, onEdit, onDelete, iconNode, fixed, onToggleFixed }: SortableAppCardProps) {
    // Only Sortable if NOT in edit mode. But requirements say "click and hold".
    // For now we enable drag always, or only when not editing?
    // "fora do modo de edição ... reorganizar" -> So disabled when isEditMode=true

    // We also need listeners for "click and hold" (Long Press). 
    // dnd-kit handles activation constraints (sensors). We will configure sensors in App.tsx.

    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: id,
        disabled: isEditMode // Disable drag in edit mode to allow simple clicks? Or simple clicks still work. 
        // Usually we want drag enabled when NOT in edit mode, as per user request.
    });

    const style: CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition,
        zIndex: isDragging ? 10 : 1,
        opacity: isDragging ? 0.5 : 1,
        touchAction: 'manipulation' // Allow scrolling, we use delay for drag
    };

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className="h-full">
            <AppCard
                title={app.title}
                description={app.description}
                icon={iconNode}
                statusColor={app.statusColor}
                cardColor={app.cardColor}
                url={app.url}
                isEditMode={isEditMode}
                onEdit={() => onEdit(app)}
                onDelete={() => onDelete(app.id)}
                fixed={fixed}
                onToggleFixed={onToggleFixed}
            />
        </div>
    );
}

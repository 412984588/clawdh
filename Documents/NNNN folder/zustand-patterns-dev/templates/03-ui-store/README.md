# UI Store

Global UI state: modals, drawers, toasts, loading overlay, command palette.

## Features
- Dynamic modal/drawer registry (any string ID)
- Toast auto-dismiss with configurable duration
- Typed modal data (pass arbitrary data, retrieve with type)
- No prop drilling for modals

## Usage

```tsx
const { openModal, addToast } = useUIStore();
const isDeleteOpen = useUIStore(selectIsModalOpen("confirm-delete"));

openModal("confirm-delete", { itemId: "123", itemName: "My Project" });
addToast({ type: "success", title: "Saved!", description: "Your changes have been saved." });
```

## Retrieving Modal Data

```tsx
const data = useUIStore((s) => s.getModalData<{ itemId: string }>("confirm-delete"));
```

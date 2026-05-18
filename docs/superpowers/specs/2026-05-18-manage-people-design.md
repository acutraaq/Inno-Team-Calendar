# Manage People Feature — Design Spec
Date: 2026-05-18

## Overview

Add UI to create and delete team members. Server actions already exist; this is purely a UI addition.

## Decisions

- **Delete cascade**: Block delete if member has any events. User must remove events first.
- **UI placement**: Gear icon in Sidebar "Team Members" header → modal.

## Server Layer Changes

**`src/lib/actions.ts`** — modify `deleteTeamMember`:
- Count events for the member before deleting.
- If count > 0, throw `Error("Cannot delete member with existing events. Remove their events first.")`.
- No schema changes required.

`createTeamMember` and `updateTeamMember` already exist and need no changes.

## New Component: `ManagePeopleModal`

**File:** `src/components/ManagePeopleModal.tsx`

**Props:**
```ts
interface ManagePeopleModalProps {
  members: SafeTeamMember[];
  isOpen: boolean;
  onClose: () => void;
  onMembersChange: () => void;
}
```

**UI states:**
1. **List view** — all members, each row has: color dot, name, trash icon button.
2. **Inline add form** — appears below list when "+ Add Member" clicked: name text input + color picker (`<input type="color">` + hex text field) + Save/Cancel.
3. **Inline delete confirm** — when trash clicked, that row expands to show "Delete [Name]? · Cancel · Delete" prompt.

**State:**
- `showAddForm: boolean`
- `addName: string`
- `addColor: string` (default `#7EB5C4`)
- `deleteConfirmId: string | null`
- `error: string`
- `loading: boolean`

**Behavior:**
- Add submit → `createTeamMember(name, color)` → `onMembersChange()` → reset form.
- Delete confirm → `deleteTeamMember(id)` → success: `onMembersChange()` / error: show inline error.
- Errors displayed inline below the triggering action.
- Modal closes on backdrop click or X button.

## Sidebar Changes

**File:** `src/components/Sidebar.tsx`

- Add `onManageClick: () => void` prop.
- Render a `Settings` (lucide) icon button next to the "Team Members" heading in the panel header.

## CalendarPageClient Changes

**File:** `src/components/CalendarPageClient.tsx`

- Add `isManageOpen: boolean` state.
- Pass `onManageClick={() => setIsManageOpen(true)}` to `<Sidebar>`.
- Render `<ManagePeopleModal>` with:
  - `members={teamMembers}`
  - `isOpen={isManageOpen}`
  - `onClose={() => setIsManageOpen(false)}`
  - `onMembersChange={refresh}` (the existing data-reload callback)

## Data Flow

```
User clicks gear
  → isManageOpen = true
  → ManagePeopleModal renders with current teamMembers

Add flow:
  form submit → createTeamMember(name, color)
    → onMembersChange() → parent refetch → modal re-renders

Delete flow:
  trash click → deleteConfirmId = id
  confirm click → deleteTeamMember(id)
    → server: event count check → throws if > 0
    → success: onMembersChange() → list updates
    → error: inline error message shown
```

## Styling

Follow existing patterns:
- Modal: `fixed inset-0` backdrop + centered `bg-white rounded-xl shadow-2xl` panel (same as delete confirm in DayDetailSheet).
- Inputs: `text-sm px-3 py-2 rounded-lg border border-stone-200 bg-white focus:outline-none focus:ring-2 focus:ring-stone-200`.
- Buttons: stone-700 primary, stone-500 ghost cancel, red-600 destructive.
- Color dot: same `w-2.5 h-2.5 rounded-full` style as Sidebar member list.

import { describe, expect, it, vi } from 'vitest';
import { commitPendingCellEdit, hasPendingCellEdit } from '../../lib/onlyoffice/sdk-api';

function spreadsheet(editing: boolean) {
  const api = {
    editing,
    asc_getCellEditMode: vi.fn(() => api.editing),
    asc_closeCellEditor: vi.fn((cancel?: boolean) => {
      api.editing = false;
      return !cancel;
    }),
  };
  return api;
}

describe('pending cell edit', () => {
  it('reports a cell being typed into', () => {
    expect(hasPendingCellEdit(spreadsheet(true))).toBe(true);
    expect(hasPendingCellEdit(spreadsheet(false))).toBe(false);
  });

  it('enters the typed text (not cancel) when there is one', () => {
    const api = spreadsheet(true);
    expect(commitPendingCellEdit(api)).toBe(true);
    expect(api.asc_closeCellEditor).toHaveBeenCalledWith(false);
    expect(api.editing).toBe(false);
  });

  it('leaves everything alone when no cell is being edited', () => {
    const api = spreadsheet(false);
    expect(commitPendingCellEdit(api)).toBe(false);
    expect(api.asc_closeCellEditor).not.toHaveBeenCalled();
  });

  it('is a no-op for word and slide editors, which have no cell editor', () => {
    expect(hasPendingCellEdit({})).toBe(false);
    expect(commitPendingCellEdit({})).toBe(false);
    expect(commitPendingCellEdit(null)).toBe(false);
  });

  it('treats a throwing SDK as nothing pending', () => {
    const api = {
      asc_getCellEditMode: () => {
        throw new Error('not ready');
      },
    };
    expect(hasPendingCellEdit(api)).toBe(false);
  });
});

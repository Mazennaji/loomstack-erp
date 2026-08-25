import { api } from '../lib/api';

export interface Machine {
  id: string;
  name: string;
  code: string;
  status: string;
  maintenanceIntervalHours: number;
  createdAt: string;
}

export interface MachineDetail extends Machine {
  usageLogs: { id: string; date: string; hoursRun: number; cycles: number }[];
  maintenanceEvents: { id: string; type: string; date: string; hoursAtService: number; notes: string | null }[];
}

export async function getMachines(): Promise<Machine[]> {
  const res = await api.get('/machines');
  return res.data;
}

export async function getMachine(id: string): Promise<MachineDetail> {
  const res = await api.get(`/machines/${id}`);
  return res.data;
}

export async function createMachine(data: {
  name: string;
  code: string;
  maintenanceIntervalHours?: number;
}): Promise<Machine> {
  const res = await api.post('/machines', data);
  return res.data;
}

export async function logUsage(data: {
  machineId: string;
  date: string;
  hoursRun: number;
  cycles: number;
}) {
  const res = await api.post('/machines/usage', data);
  return res.data;
}

export async function logMaintenance(data: {
  machineId: string;
  type: string;
  date: string;
  hoursAtService: number;
  notes?: string;
}) {
  const res = await api.post('/machines/maintenance', data);
  return res.data;
}
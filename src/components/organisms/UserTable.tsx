/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { UserCheck, ShieldAlert, CheckCircle2, XCircle, MoreVertical } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface UserTableProps {
  users: any[];
  onApprove: (id: string) => void;
  onToggle: (id: string, current: boolean) => void;
}

export const UserTable = ({ users, onApprove, onToggle }: UserTableProps) => {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <Table className="min-w-[800px]">
          <TableHeader className="bg-gray-50/80">
            <TableRow className="hover:bg-transparent border-b border-gray-100">
              <TableHead className="py-4 px-6 font-semibold text-gray-600">Info Pengguna</TableHead>
              <TableHead className="font-semibold text-gray-600">Role</TableHead>
              <TableHead className="font-semibold text-gray-600">Status Verifikasi</TableHead>
              <TableHead className="font-semibold text-gray-600">Status Akun</TableHead>
              <TableHead className="text-right px-6 font-semibold text-gray-600">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-50">
                <TableCell className="py-4 px-6">
                  <div className="flex flex-col">
                    <span className="font-bold text-gray-900">{user.name}</span>
                    <span className="text-sm text-gray-500">{user.email}</span>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1.5">
                    {user.roles?.map((r: any) => (
                      <Badge key={r.id} variant="secondary" className="bg-cyan-50 text-[#12b3d6] hover:bg-cyan-100 border-none font-medium px-2.5 py-0.5 rounded-md">
                        {r.name}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  {user.is_approved ? (
                    <div className="flex items-center text-green-600 text-sm font-medium">
                      <CheckCircle2 size={16} className="mr-1.5" /> Terverifikasi
                    </div>
                  ) : (
                    <div className="flex items-center text-amber-500 text-sm font-medium">
                      <ShieldAlert size={16} className="mr-1.5" /> Menunggu
                    </div>
                  )}
                </TableCell>
                <TableCell>
                  <div className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider ${
                    user.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {user.is_active ? 'AKTIF' : 'NONAKTIF'}
                  </div>
                </TableCell>
                <TableCell className="text-right px-6">
                  <div className="flex justify-end items-center gap-2">
                    {!user.is_approved && (
                      <Button 
                        size="sm" 
                        className="bg-[#12b3d6] hover:bg-[#0fa0bf] shadow-md shadow-cyan-200/50 rounded-lg h-8"
                        onClick={() => onApprove(user.id)}
                      >
                        <UserCheck size={16} className="mr-1.5" /> Approve
                      </Button>
                    )}
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-gray-400 hover:text-gray-600 h-8 w-8 rounded-lg">
                          <MoreVertical size={18} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl shadow-xl border-gray-100 p-1">
                        <DropdownMenuItem 
                          className="cursor-pointer p-2.5 rounded-lg font-medium"
                          onClick={() => onToggle(user.id, !user.is_active)}
                        >
                          {user.is_active ? (
                            <div className="flex items-center text-red-500">
                              <XCircle size={16} className="mr-2" /> Nonaktifkan Akun
                            </div>
                          ) : (
                            <div className="flex items-center text-green-600">
                              <CheckCircle2 size={16} className="mr-2" /> Aktifkan Akun
                            </div>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
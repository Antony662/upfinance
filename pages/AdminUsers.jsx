import React, { useState, useEffect } from "react";
import { User } from "@/api/entities";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Users, Crown, Search, UserX } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminUsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPlan, setFilterPlan] = useState("all");

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const usersData = await User.list();
      setUsers(usersData);
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
    } finally {
      setLoading(false);
    }
  };

  const updateUserPlan = async (userId, newPlan) => {
    try {
      await User.update(userId, { plan: newPlan });
      loadUsers();
    } catch (error) {
      console.error("Erro ao atualizar plano do usuário:", error);
    }
  };

  const updateUserRole = async (userId, newRole) => {
    try {
      await User.update(userId, { role: newRole });
      loadUsers();
    } catch (error) {
      console.error("Erro ao atualizar role do usuário:", error);
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm("Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.")) {
      try {
        await User.delete(userId);
        loadUsers();
      } catch (error) {
        console.error("Erro ao excluir usuário:", error);
      }
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPlan = filterPlan === "all" || user.plan === filterPlan;
    return matchesSearch && matchesPlan;
  });

  const getPlanBadge = (plan) => {
    const config = {
      basic: { label: "Básico", className: "bg-gray-100 text-gray-800" },
      premium: { label: "Premium", className: "bg-blue-100 text-blue-800" },
      enterprise: { label: "Enterprise", className: "bg-purple-100 text-purple-800" }
    };
    const { label, className } = config[plan] || config.basic;
    return <Badge className={className}>{label}</Badge>;
  };

  const getRoleBadge = (role) => {
    return role === "admin" ? (
      <Badge className="bg-amber-100 text-amber-800">
        <Crown className="w-3 h-3 mr-1" />
        Admin
      </Badge>
    ) : (
      <Badge variant="outline">Usuário</Badge>
    );
  };

  if (loading) return <div className="p-8">Carregando usuários...</div>;

  return (
    <div className="flex-1 p-8 bg-slate-50">
      <div className="max-w-7xl mx-auto space-y-8">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Gerenciamento de Usuários
              </CardTitle>
              <div className="flex gap-3 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    placeholder="Buscar usuários..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={filterPlan} onValueChange={setFilterPlan}>
                  <SelectTrigger className="w-32">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="basic">Básico</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Plano</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Cadastro</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div className="font-medium">{user.full_name}</div>
                      <div className="text-sm text-slate-500">{user.email}</div>
                    </TableCell>
                    <TableCell>{getPlanBadge(user.plan)}</TableCell>
                    <TableCell>{getRoleBadge(user.role)}</TableCell>
                    <TableCell>
                      {format(new Date(user.created_date), "dd/MM/yyyy", { locale: ptBR })}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Select onValueChange={(value) => updateUserPlan(user.id, value)}>
                          <SelectTrigger className="w-24 h-8">
                            <SelectValue placeholder="Plano" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="basic">Básico</SelectItem>
                            <SelectItem value="premium">Premium</SelectItem>
                            <SelectItem value="enterprise">Enterprise</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select onValueChange={(value) => updateUserRole(user.id, value)}>
                          <SelectTrigger className="w-20 h-8">
                            <SelectValue placeholder="Role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">User</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8"
                          onClick={() => deleteUser(user.id)}
                        >
                          <UserX className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
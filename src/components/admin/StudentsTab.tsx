
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { User } from '@/types';
import { PlusIcon, Trash2Icon } from 'lucide-react';

interface StudentsTabProps {
  users: User[];
  setUsers: React.Dispatch<React.SetStateAction<User[]>>;
}

const StudentsTab: React.FC<StudentsTabProps> = ({ users, setUsers }) => {
  const [newUser, setNewUser] = useState<Partial<User>>({
    username: '',
    password: '',
    name: '',
    email: '',
    role: 'student'
  });
  
  const handleUserChange = (field: string, value: string) => {
    setNewUser(prev => ({ ...prev, [field]: value }));
  };
  
  const addUser = () => {
    if (!newUser.username || !newUser.password || !newUser.name) {
      toast.error('Please fill all the required fields');
      return;
    }
    
    const user: User = {
      id: (users.length + 1).toString(),
      username: newUser.username || '',
      password: newUser.password || '',
      name: newUser.name,
      email: newUser.email,
      role: 'student'
    };
    
    setUsers(prev => [...prev, user]);
    
    setNewUser({
      username: '',
      password: '',
      name: '',
      email: '',
      role: 'student'
    });
    
    toast.success('Student added successfully');
  };
  
  const deleteUser = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    toast.success('Student deleted successfully');
  };
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h2 className="text-xl font-medium">Manage Students</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="sm" className="h-8 gap-1">
              <PlusIcon className="h-4 w-4" />
              Add Student
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Student</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Username*</Label>
                  <Input
                    id="username"
                    value={newUser.username}
                    onChange={(e) => handleUserChange('username', e.target.value)}
                    placeholder="Enter username"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password*</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => handleUserChange('password', e.target.value)}
                    placeholder="Enter password"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="name">Full Name*</Label>
                <Input
                  id="name"
                  value={newUser.name}
                  onChange={(e) => handleUserChange('name', e.target.value)}
                  placeholder="Enter full name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUser.email}
                  onChange={(e) => handleUserChange('email', e.target.value)}
                  placeholder="Enter email"
                />
              </div>
              
              <Button onClick={addUser}>Add Student</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="rounded-md border">
        <div className="relative w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="h-10 px-4 text-left font-medium">ID</th>
                <th className="h-10 px-4 text-left font-medium">Username</th>
                <th className="h-10 px-4 text-left font-medium">Name</th>
                <th className="h-10 px-4 text-left font-medium">Email</th>
                <th className="h-10 px-4 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="border-b">
                  <td className="p-2 align-middle">{user.id}</td>
                  <td className="p-2 align-middle">{user.username}</td>
                  <td className="p-2 align-middle">{user.name}</td>
                  <td className="p-2 align-middle">{user.email}</td>
                  <td className="p-2 align-middle">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => deleteUser(user.id)}
                      className="h-8 w-8 text-destructive"
                    >
                      <Trash2Icon className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-muted-foreground">
                    No students added yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StudentsTab;

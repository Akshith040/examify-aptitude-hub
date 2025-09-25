// AddTopicDialog.tsx
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

interface AddTopicDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  topics: string[];
  onAddTopic: (topic: string) => void;
}

const AddTopicDialog: React.FC<AddTopicDialogProps> = ({
  open,
  onOpenChange,
  topics,
  onAddTopic,
}) => {
  const [newTopicName, setNewTopicName] = useState('');

  const handleAddNewTopic = () => {
    if (!newTopicName.trim()) {
      toast.error('Please enter a topic name');
      return;
    }
    
    if (topics.includes(newTopicName.trim())) {
      toast.error('This topic already exists');
      return;
    }
    
    onAddTopic(newTopicName.trim());
    setNewTopicName('');
    onOpenChange(false);
    toast.success(`Topic "${newTopicName.trim()}" added successfully`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Topic</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex flex-col space-y-2">
            <Label htmlFor="topicName">Topic Name</Label>
            <Input
              id="topicName"
              value={newTopicName}
              onChange={(e) => setNewTopicName(e.target.value)}
              placeholder="Enter new topic name"
            />
          </div>
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddNewTopic}>
              Add Topic
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddTopicDialog;
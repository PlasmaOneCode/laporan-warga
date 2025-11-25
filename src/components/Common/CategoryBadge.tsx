import { Badge } from '@/components/ui/badge';
import { Lightbulb, Construction, Trash2, Squirrel } from 'lucide-react';

interface CategoryBadgeProps {
  category: string;
}

const CategoryBadge = ({ category }: CategoryBadgeProps) => {
  const config: Record<string, { label: string; icon: any; className: string }> = {
    'lampu_mati': {
      label: 'Lampu Mati',
      icon: Lightbulb,
      className: 'bg-warning/10 text-warning',
    },
    'jalan_berlubang': {
      label: 'Jalan Berlubang',
      icon: Construction,
      className: 'bg-destructive/10 text-destructive',
    },
    'sampah': {
      label: 'Sampah',
      icon: Trash2,
      className: 'bg-success/10 text-success',
    },
    'hewan_liar': {
      label: 'Hewan Liar',
      icon: Squirrel,
      className: 'bg-secondary/10 text-secondary',
    },
  };

  const { label, icon: Icon, className } = config[category] || {
    label: category,
    icon: null,
    className: 'bg-muted/50 text-muted-foreground',
  };

  return (
    <Badge variant="outline" className={className}>
      {Icon && <Icon className="mr-1 h-3 w-3" />}
      {label}
    </Badge>
  );
};

export default CategoryBadge;

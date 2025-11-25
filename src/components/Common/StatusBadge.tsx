import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
  status: 'open' | 'in_progress' | 'done' | 'rejected';
}

const StatusBadge = ({ status }: StatusBadgeProps) => {
  const config = {
    open: {
      label: 'Terbuka',
      className: 'bg-info/10 text-info hover:bg-info/20',
    },
    in_progress: {
      label: 'Proses',
      className: 'bg-warning/10 text-warning hover:bg-warning/20',
    },
    done: {
      label: 'Selesai',
      className: 'bg-success/10 text-success hover:bg-success/20',
    },
    rejected: {
      label: 'Ditolak',
      className: 'bg-destructive/10 text-destructive hover:bg-destructive/20',
    },
  };

  const { label, className } = config[status] || config.open;

  return (
    <Badge variant="outline" className={className}>
      {label}
    </Badge>
  );
};

export default StatusBadge;

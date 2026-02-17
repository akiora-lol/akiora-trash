import { MessageCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface TelegramBotButtonProps {
  className?: string;
  size?: 'sm' | 'default' | 'lg';
  variant?: 'default' | 'outline' | 'ghost';
}

export default function TelegramBotButton({ 
  className, 
  size = 'default',
  variant = 'default'
}: TelegramBotButtonProps) {
  const handleOpenTelegram = () => {
    window.open('https://t.me/SpeechToTextVictoria_bot', '_blank');
  };

  return (
    <Button
      onClick={handleOpenTelegram}
      size={size}
      variant={variant}
      className={className}
    >
      <MessageCircle className="mr-2 h-4 w-4" />
      Открыть Telegram бот
    </Button>
  );
}

import logoUrl from '@/assets/svg/blue-yang.svg'
// Util Imports
import { cn } from '@/lib/utils'


const Logo = ({ 
  className, 
  size = '40', // в пикселях, не в Tailwind единицах
  rotationSpeed = 0 // секунд на один оборот
}: { 
  className?: string;
  size?: string; // размер в пикселях
  rotationSpeed?: number; // скорость вращения в секундах
}) => {
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <img 
        src={logoUrl} 
        style={{ 
          width: size, 
          height: size,
          animation: rotationSpeed ? `spin ${rotationSpeed}s linear infinite` : 'none'
        }}
        className="object-contain"
        alt="Logo" 
      />
    </div>
  )
}
export default Logo

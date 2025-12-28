import { useEffect, useRef } from "react";

export function AmbientEffects() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    
    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);
    
    // Particle system
    const particles: Particle[] = [];
    const particleCount = 20;
    
    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;
      opacity: number;
      oscillation: number;
      oscillationSpeed: number;
      
      constructor(canvasWidth: number, canvasHeight: number) {
        this.x = Math.random() * canvasWidth;
        this.y = Math.random() * canvasHeight;
        this.size = Math.random() * 3 + 1;
        this.speedX = Math.random() * 1 - 0.5;
        this.speedY = Math.random() * 1 - 0.5;
        this.color = Math.random() > 0.5 ? 
          "rgba(96, 165, 250, 0.3)" : // blue
          "rgba(192, 132, 252, 0.3)"; // purple
        this.opacity = Math.random() * 0.5 + 0.1;
        this.oscillation = Math.random() * Math.PI * 2;
        this.oscillationSpeed = Math.random() * 0.02 + 0.005;
      }
      
      update(canvasWidth: number, canvasHeight: number) {
        this.x += this.speedX;
        this.y += this.speedY;
        this.oscillation += this.oscillationSpeed;
        
        // Oscillate size for subtle pulsing effect
        this.size = Math.sin(this.oscillation) * 0.5 + 1.5;
        
        // Reset particles that go off screen
        if (this.x < 0 || this.x > canvasWidth || this.y < 0 || this.y > canvasHeight) {
          this.x = Math.random() * canvasWidth;
          this.y = Math.random() * canvasHeight;
        }
      }
      
      draw(ctx: CanvasRenderingContext2D) {
        ctx.fillStyle = this.color;
        ctx.globalAlpha = this.opacity;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Create particles
    for (let i = 0; i < particleCount; i++) {
      particles.push(new Particle(canvas.width, canvas.height));
    }
    
    // Animation loop
    let animationFrameId: number;
    let lastTime = 0;
    const animationInterval = 1000 / 30; // Target ~30fps
    
    const animate = (timestamp: number) => {
      if (!ctx) return;
      
      if (timestamp - lastTime >= animationInterval) {
        // Clear with a semi-transparent fill for trail effect
        ctx.fillStyle = "rgba(15, 23, 42, 0.1)";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Update and draw particles
        particles.forEach(particle => {
          particle.update(canvas.width, canvas.height);
          particle.draw(ctx);
        });
        
        lastTime = timestamp;
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate(0);
    
    // Cleanup
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-0"
      style={{ mixBlendMode: "overlay" }}
    />
  );
}
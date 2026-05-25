export const SIDEBAR_STYLES = {
  // Tiêu đề các mục lớn (như Trang, Dự án của tôi, Chu kỳ tập trung) - 12px, font-medium
  sectionTitle: 'text-[12px] tracking-tight font-medium text-secondary',
  
  // Font chữ cho liên kết chính - 13px
  linkText: 'text-[13px] tracking-tight',
  
  // Trạng thái của liên kết chính
  linkActive: 'bg-zinc-200 font-medium text-foreground',
  linkInactive: 'text-secondary hover:text-foreground hover:bg-zinc-200/60',
  
  // Font chữ cho liên kết phụ (Đồng bộ về 12px)
  nestedLinkText: 'text-[12px] tracking-tight',
  nestedLinkActive: 'bg-zinc-200 font-medium text-foreground',
  // Nhạt hơn so với liên kết chính (text-secondary/70)
  nestedLinkInactive: 'text-secondary/70 hover:text-foreground hover:bg-zinc-200/60',
  
  // Tiêu đề trạng thái con ("Hiện tại", "Tiếp theo") - 12px, font-medium, màu nhạt hơn
  subLabel: 'text-[12px] tracking-tight font-medium text-secondary/70 px-2.5 block mb-0.5',
  
  // Nút nhấn mở rộng "Chu kỳ đã qua" - 12px, font-medium, màu nhạt hơn
  subButton: 'w-full text-left text-[12px] tracking-tight font-medium text-secondary/70 px-2.5 py-1 hover:text-foreground transition-colors flex items-center justify-between cursor-pointer'
};

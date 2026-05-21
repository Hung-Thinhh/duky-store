export interface Feedback {
  id: string;
  name: string;
  location: string;
  avatar: string;
  rating: number;
  content: string;
}

export const FEEDBACKS: Feedback[] = [
  {
    id: 'fb-1',
    name: 'Minh Quân',
    location: 'Cần Thơ',
    avatar: '/assets/mau_nam_1.png',
    rating: 5,
    content: 'Boot da rất đẹp, form chuẩn, đi êm chân. Nhân viên tư vấn nhiệt tình, sẽ ủng hộ lâu dài.'
  },
  {
    id: 'fb-2',
    name: 'Thanh Vy',
    location: 'Cần Thơ',
    avatar: '/assets/mau_nu_1.png',
    rating: 5,
    content: 'Mình mua online nhưng vừa size hoàn hảo. Giao hàng nhanh, đóng gói cẩn thận.'
  },
  {
    id: 'fb-3',
    name: 'Hoàng Nam',
    location: 'Cần Thơ',
    avatar: '/assets/mau_nam_2.png',
    rating: 5,
    content: 'Chất da mịn, cứng cáp nhưng mềm, Shop hỗ trợ đổi size nhanh chóng.'
  },
  {
    id: 'fb-4',
    name: 'Linh Đan',
    location: 'Hà Nội',
    avatar: '/assets/mau_nu_2.png',
    rating: 5,
    content: 'Đồ ở Duky Store chưa bao giờ làm mình thất vọng. Giày đi cực kỳ tôn dáng và sang.'
  },
  {
    id: 'fb-5',
    name: 'Quốc Bảo',
    location: 'TP. Hồ Chí Minh',
    avatar: '/assets/mau_nam_3.png',
    rating: 5,
    content: 'Đóng gói rất sang trọng, thích hợp làm quà tặng. Chất lượng vượt mong đợi trong tầm giá.'
  }
];

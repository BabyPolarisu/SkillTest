# TaskFlow — Fullstack To-Do List Application

โปรเจกต์ระบบจัดการรายการงาน (To-Do List Web Application) สำหรับแบบทดสอบ **Skill Test for Fullstack Developer Trainee** พัฒนาโดย **Kitthanakorn Chueaprathum**

## ฟีเจอร์หลักตามโจทย์ (Option 3)
1. **แยกรายการงานตามผู้ใช้งาน (Multi-user Task List)**:
   - ผู้ใช้แต่ละคนมีรายการงานและหมวดหมู่ของตัวเอง
   - รองรับการสมัครบัญชีผู้ใช้ใหม่ เข้าสู่ระบบด้วยอีเมล หรือสลับบัญชีทดสอบได้จากแถบด้านบน
2. **การจัดหมวดหมู่งาน (Categories)**:
   - เพิ่ม/ลบหมวดหมู่งานของตัวเอง พร้อมกำหนดสีป้ายกำกับได้ตามต้องการ
3. **การจัดการงานและสถานะ (Task CRUD & Status)**:
   - เพิ่ม แก้ไข และลบรายการงาน
   - เปลี่ยนสถานะงานได้ 3 สถานะ: รอดำเนินการ (`pending`), กำลังทำ (`in_progress`), และเสร็จสิ้น (`completed`)
   - กำหนดระดับความสำคัญของงาน (`low`, `medium`, `high`)
4. **การแท็กผู้ที่เกี่ยวข้อง (User Tagging / Assignment)**:
   - สามารถแท็กผู้ใช้งานคนอื่นในระบบเข้ามาร่วมในงานได้หลายคน และผู้ที่ถูกแท็กจะเห็นงานนั้นในรายการของตนเองด้วย
5. **การค้นหาและกรองข้อมูล (Search & Filter)**:
   - ค้นหาจากชื่องานหรือรายละเอียด
   - กรองตามหมวดหมู่ สถานะ ผู้ที่ถูกแท็ก และขอบเขตงาน (ทั้งหมด / งานของฉัน / งานที่ถูกแท็ก)
6. **Dashboard สรุปผลและกำหนดเวลา (Dashboard & Schedule)**:
   - แสดงการ์ดสรุปจำนวนงานทั้งหมด งานแต่ละสถานะ และเปอร์เซ็นต์ความสำเร็จ
   - แสดงกราฟแท่งสัดส่วนความคืบหน้าแยกตามหมวดหมู่
   - กำหนดวันและเวลาส่งงาน (`dueDate` และ `dueTime`) พร้อมตารางแจ้งเตือนงานที่ใกล้ถึงกำหนดหรือเลยกำหนด

---

## เทคโนโลยีที่ใช้ (Tech Stack)
- **Framework**: Next.js 15 (App Router - Fullstack Frontend & API Routes)
- **Language**: TypeScript
- **Styling**: Tailwind CSS + Lucide Icons
- **Data Storage**: JSON File Persistence (`data/db.json`) พร้อมระบบ In-memory Fallback รองรับการ Deploy บน Serverless (Vercel)

---

## วิธีติดตั้งและรันโปรเจกต์ในเครื่อง (Local Development)

1. ติดตั้ง Dependencies:
   ```bash
   npm install
   ```

2. รันเซิร์ฟเวอร์สำหรับพัฒนา:
   ```bash
   npm run dev
   ```

3. เปิดเบราว์เซอร์ไปที่ `http://localhost:3000`

# TaskFlow — Fullstack To-Do List & Task Management System

โปรเจกต์เว็บแอปพลิเคชันจัดการรายการงานและตารางเวลา (**To-Do List Application**)  
**ผู้พัฒนา (Developer):** Kitthanakorn Chueaprathum  
**GitHub Repository:** [https://github.com/BabyPolarisu/SkillTest](https://github.com/BabyPolarisu/SkillTest)
**Deploy:** [https://skill-test.vercel.app](https://skill-test.vercel.app)

---

## 📌 ภาพรวมของระบบ (System Overview)

**TaskFlow** เป็นระบบจัดการงานแบบ Fullstack ที่ออกแบบมาให้ผู้ใช้งานแต่ละคนสามารถจัดการรายการงานของตนเอง แบ่งหมวดหมู่ตามมาตรฐานของทีม แนบรูปภาพหรือไฟล์เอกสารประกอบงาน แท็กผู้ที่เกี่ยวข้องเพื่อทำงานร่วมกัน พร้อมระบบแจ้งเตือนเมื่อถูกแท็ก ระบบค้นหาแบบ Autocomplete Dropdown และหน้า Dashboard สรุปสถิติความคืบหน้าพร้อมตารางกำหนดเวลาส่งงานที่แบ่งระดับสีตามความเร่งด่วน

---

## ✨ ฟีเจอร์หลักของระบบ (Key Features)

1. **ระบบผู้ใช้งานและการแยกข้อมูลรายบุคคล (Multi-User & Authentication)**
   - ผู้ใช้แต่ละคนมีรายการงานของตนเอง (รวมถึงเห็นงานที่เพื่อนร่วมทีมแท็กมาหา)
   - รองรับการสมัครบัญชีผู้ใช้ใหม่ เข้าสู่ระบบด้วยอีเมล และมีปุ่มสลับบัญชีผู้ใช้งานด่วน (Quick User Switcher) บนแถบเมนูด้านบนเพื่อความสะดวกในการทดสอบ
2. **การจัดการงานและสถานะงาน (Task CRUD & Status Management)**
   - เพิ่ม แก้ไข ดูรายละเอียด และลบรายการงาน
   - เปลี่ยนสถานะงานได้ 3 สถานะ: `รอดำเนินการ (Pending)`, `กำลังทำ (In Progress)`, และ `เสร็จสิ้น (Completed)`
   - กำหนดระดับความสำคัญของงาน (`ต่ำ`, `ปานกลาง`, `สูง`)
3. **ระบบแนบรูปภาพและไฟล์เอกสาร (Image & File Attachments)**
   - รองรับการอัปโหลดรูปภาพประกอบงาน (`.png`, `.jpg`, `.webp`) และไฟล์เอกสาร (`.pdf`, `.docx`, `.xlsx`, `.zip`, `.txt` ฯลฯ)
   - แสดงภาพตัวอย่าง (Thumbnail) บนการ์ดงาน และสามารถคลิกเปิดหน้าต่างรายละเอียดงานเพื่อขยายดูรูปภาพขนาดเต็มจอหรือดาวน์โหลดไฟล์แนบได้ทันที
4. **หมวดหมู่กลางมาตรฐานของระบบ (Shared System Categories)**
   - จัดระเบียบงานด้วย 6 หมวดหมู่หลักที่สมาชิกทุกคนใช้ร่วมกัน:
     - `งานพัฒนาระบบ (Development)`
     - `ประชุม & ประสานงาน (Meeting)`
     - `ออกแบบ UX/UI (Design)`
     - `เอกสาร & รายงาน (Document)`
     - `งานด่วน & แก้บั๊ก (Urgent/Bug)`
     - `งานทั่วไป (General)`
5. **การแท็กผู้ที่เกี่ยวข้องและระบบแจ้งเตือน (User Tagging & Notification System)**
   - สามารถแท็กผู้ใช้งานคนอื่นในระบบเข้ามาร่วมในงานได้หลายคน
   - มีกระดิ่งแจ้งเตือนพร้อมจุดแดงแสดงจำนวนงานที่ถูกแท็กใหม่ และเมื่อคลิกที่รายการแจ้งเตือน ระบบจะเลื่อนไปยังงานนั้นและเปิดหน้าต่างรายละเอียดงานขึ้นมาทันที
6. **ระบบค้นหาอัจฉริยะและตัวกรองข้อมูล (Smart Search Dropdown & Filters)**
   - ช่องค้นหามี Autocomplete Dropdown แสดงทั้ง **รายชื่อผู้ใช้งาน** (คลิกเพื่อกรองดูงานของคนนั้น) และ **รายการงานที่ตรงกับคำค้นหา** (คลิกเพื่อเปิดดูงานทันที)
   - กรองงานตามหมวดหมู่ สถานะ บุคคลที่เกี่ยวข้อง และขอบเขตงาน (`ทั้งหมด`, `งานของฉัน`, `ถูกแท็ก`)
7. **Dashboard สรุปสถิติและตารางกำหนดเวลา 3 ระดับสี (Dashboard & 3-Tier Schedule Indicators)**
   - แสดงการ์ดสรุปจำนวนงานทั้งหมด งานในแต่ละสถานะ เปอร์เซ็นต์ความสำเร็จ และกราฟแท่งสัดส่วนงานแยกตามหมวดหมู่
   - กำหนดวันและเวลาส่งงาน (`dueDate` และ `dueTime`) พร้อมระบบสีแจ้งเตือนระยะเวลาครบกำหนด 3 ระดับ:
     - 🔴 **สีแดง**: ครบกำหนด **วันนี้ / พรุ่งนี้** (หรือเลยกำหนด)
     - 🟡 **สีเหลือง**: ครบกำหนดภายใน **2 – 3 วัน**
     - 🟢 **สีเขียว**: ครบกำหนดตั้งแต่ **4 วันขึ้นไป**
8. **รองรับโหมดสว่างและโหมดมืดถนอมสายตา (Light Blue Theme & Eye-Care Dark Mode)**
   - สลับธีมระหว่างโหมดสว่างโทนฟ้า-น้ำเงิน และโหมดมืดโทนเทา-ม่วงครามถนอมสายตาได้จากแถบด้านบน

---

## 🛠️ เทคโนโลยีที่ใช้ (Tech Stack)

| ส่วนการทำงาน (Layer) | เทคโนโลยี (Technology) | รายละเอียดการใช้งาน |
| :--- | :--- | :--- |
| **Frontend Framework** | **Next.js 16 (App Router)**, **React 19** | พัฒนาส่วนติดต่อผู้ใช้แบบ Component-based และจัดการ State ฝั่ง Client |
| **Backend / API** | **Next.js Route Handlers (RESTful API)** | ให้บริการ API Endpoints (`/api/users`, `/api/tasks`, `/api/tasks/[id]`, `/api/categories`) |
| **Programming Language** | **TypeScript** | กำหนดโครงสร้างข้อมูล (`User`, `Task`, `Category`, `TaskAttachment`) แบบ Type-safe ทั้งระบบ |
| **Styling & UI** | **Tailwind CSS**, **Lucide React Icons** | ออกแบบ Responsive UI รองรับทุกขนาดหน้าจอ พร้อมระบบ Light / Dark Mode |
| **Database & Storage** | **JSON File Persistence (`data/db.json`) + In-Memory Fallback** | บันทึกข้อมูลลงไฟล์ JSON อัตโนมัติเมื่อรันบน Local และมีระบบ In-memory state รองรับการทำงานบน Serverless Environment (Vercel) โดยไม่ต้องตั้งค่าฐานข้อมูลภายนอกเพิ่มเติม |
| **Deployment** | **Vercel & GitHub** | รองรับการทำ Continuous Deployment (CI/CD) เชื่อมต่อจาก GitHub ขึ้นสู่ Vercel |

---

## 📂 โครงสร้างโปรเจกต์ (Project Structure)

```text
├── data/
│   └── db.json                     # ไฟล์ฐานข้อมูลเริ่มต้น (Users, Categories, Tasks)
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── categories/route.ts # API ดึงข้อมูลหมวดหมู่มาตรฐานของระบบ
│   │   │   ├── tasks/route.ts      # API ดึงรายการงานและสร้างงานใหม่
│   │   │   ├── tasks/[id]/route.ts # API แก้ไขข้อมูลงาน เปลี่ยนสถานะ และลบงาน
│   │   │   └── users/route.ts      # API จัดการผู้ใช้งาน (สมัครสมาชิก / เข้าสู่ระบบ)
│   │   ├── globals.css             # ตั้งค่า Tailwind CSS และสีพื้นหลังตามธีม
│   │   ├── layout.tsx              # โครงสร้างหลักของหน้าเว็บและฟอนต์ Prompt
│   │   └── page.tsx                # หน้าหลักของระบบ (Navbar, Search, Filters, Task List)
│   ├── components/
│   │   ├── DashboardStats.tsx      # คอมโพเนนต์แสดงสถิติงาน กราฟหมวดหมู่ และตารางเวลา
│   │   ├── TaskDetailModal.tsx     # หน้าต่างแสดงรายละเอียดงาน รูปภาพขยาย และดาวน์โหลดไฟล์แนบ
│   │   ├── TaskFormModal.tsx       # ฟอร์มเพิ่ม/แก้ไขงาน อัปโหลดไฟล์ และแท็กผู้เกี่ยวข้อง
│   │   └── UserAuthModal.tsx       # หน้าต่างสมัครผู้ใช้งานใหม่และเข้าสู่ระบบ
│   ├── lib/
│   │   ├── db.ts                   # ฟังก์ชันอ่าน/เขียนฐานข้อมูลและข้อมูลตั้งต้น
│   │   └── schedule.ts             # ฟังก์ชันคำนวณระยะวันครบกำหนดและกำหนดสี 3 ระดับ (แดง/เหลือง/เขียว)
│   └── types/
│       └── todo.ts                 # TypeScript Interfaces สำหรับข้อมูลทั้งหมดในระบบ
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## 🚀 วิธีติดตั้งและรันโปรเจกต์ในเครื่อง (Local Development)

1. **โคลนโปรเจกต์และเข้าไปยังโฟลเดอร์งาน**
   ```bash
   git clone https://github.com/BabyPolarisu/SkillTest.git
   cd SkillTest
   ```

2. **ติดตั้ง Dependencies**
   ```bash
   npm install
   ```

3. **รันเซิร์ฟเวอร์สำหรับพัฒนา (Development Server)**
   ```bash
   npm run dev
   ```

4. **เปิดเข้าใช้งานผ่านเบราว์เซอร์**
   - เปิดไปที่ [http://localhost:3000](http://localhost:3000)

---

## 🔑 บัญชีผู้ใช้งานตัวอย่างสำหรับทดสอบ (Demo Accounts)

คุณสามารถกดสลับบัญชีผู้ใช้งานได้ทันทีจาก Dropdown มุมขวาบนของหน้าเว็บ หรือเข้าสู่ระบบด้วยอีเมลต่อไปนี้ (รหัสผ่าน: `password123`):
- **Kitthanakorn C.** (`kitthanakorn@example.com`) — *Fullstack Trainee*
- **Nattapong S.** (`nattapong@example.com`) — *Frontend Developer*
- **Pimchanok W.** (`pimchanok@example.com`) — *UX/UI Designer*
- **Sarawut K.** (`sarawut@example.com`) — *Project Manager*

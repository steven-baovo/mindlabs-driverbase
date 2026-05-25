import { db, LocalCycle } from './db';
import { v4 as uuidv4 } from 'uuid';
import { triggerSync } from './sync-engine';

// Helper tính toán ngày bắt đầu chu kỳ gần nhất
function getStartOfWeekDate(date: Date, startDay: number): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  
  // startDay: 1 (Thứ Hai) -> 7 (Chủ Nhật)
  // JS Date.getDay(): 0 (Chủ Nhật) -> 6 (Thứ Bảy)
  const currentDay = result.getDay() === 0 ? 7 : result.getDay();
  
  let diff = currentDay - startDay;
  if (diff < 0) {
    diff += 7;
  }
  
  result.setDate(result.getDate() - diff);
  return result;
}

export async function runAutoCycleEngine() {
  // Lấy cài đặt cấu hình từ localStorage
  const durationWeeks = parseInt(localStorage.getItem('cycle_duration_weeks') || '1', 10);
  const startDay = parseInt(localStorage.getItem('cycle_start_day') || '1', 10); // 1 = Thứ Hai
  const autoTransfer = localStorage.getItem('auto_transfer_unfinished') !== 'false'; // mặc định true

  const nowStr = new Date().toISOString();
  const today = new Date();

  await db.transaction('rw', [db.cycles, db.issues, db.outbox], async () => {
    // 1. Lấy toàn bộ cycles chưa bị xóa
    const cycles = await db.cycles.where({ is_deleted: 0 }).toArray();
    cycles.sort((a, b) => a.number - b.number);

    // Tự động chuyển đổi tên từ "Chu kỳ X" sang "Cycle X" trong cơ sở dữ liệu
    for (const c of cycles) {
      if (c.name.startsWith('Chu kỳ ')) {
        const numStr = c.name.replace('Chu kỳ ', '');
        const newName = `Cycle ${numStr}`;
        c.name = newName; // Cập nhật mảng đang xử lý trong bộ nhớ
        await db.cycles.update(c.id, { name: newName, is_synced: 0, updated_at: nowStr });
        await db.outbox.add({
          action: 'update',
          table_name: 'cycles',
          record_id: c.id,
          payload: { name: newName, updated_at: nowStr, is_synced: 0 },
          created_at: nowStr
        });
      }
    }

    // 2. Trường hợp CHƯA CÓ chu kỳ nào: khởi tạo gối đầu 3 chu kỳ đầu tiên
    if (cycles.length === 0) {
      const isOnline = typeof window !== 'undefined' ? navigator.onLine : true;
      const initialPullDone = typeof window !== 'undefined' ? localStorage.getItem('mindlabs_initial_pull_done') === 'true' : false;
      if (isOnline && !initialPullDone) {
        // Nếu online và chưa pull lần đầu, đợi sync kéo cycles từ Supabase về trước để tránh sinh trùng
        return;
      }

      let cycleStart = getStartOfWeekDate(today, startDay);

      for (let i = 1; i <= 3; i++) {
        const id = uuidv4();
        const cycleEnd = new Date(cycleStart);
        cycleEnd.setDate(cycleEnd.getDate() + (durationWeeks * 7) - 1);
        cycleEnd.setHours(23, 59, 59, 999);

        const newCycle: LocalCycle = {
          id,
          user_id: 'local-user',
          number: i,
          name: `Cycle ${i}`,
          is_active: i === 1, // Chu kỳ 1 là active
          start_date: cycleStart.toISOString(),
          end_date: cycleEnd.toISOString(),
          created_at: nowStr,
          updated_at: nowStr,
          is_synced: 0,
          is_deleted: 0
        };

        await db.cycles.add(newCycle);
        await db.outbox.add({
          action: 'create',
          table_name: 'cycles',
          record_id: id,
          payload: newCycle,
          created_at: nowStr
        });

        // Chu kỳ tiếp theo bắt đầu ngay sau chu kỳ cũ kết thúc
        cycleStart = new Date(cycleEnd);
        cycleStart.setDate(cycleStart.getDate() + 1);
        cycleStart.setHours(0, 0, 0, 0);
      }
      triggerSync();
      return;
    }

    // 3. Đã có chu kỳ, đối chiếu để tự động chuyển giao và gối đầu
    let activeCycle = cycles.find(c => c.is_active === true);
    
    // Nếu không tìm thấy active cycle nhưng có cycle, kích hoạt cycle lớn nhất hoặc cycle thích hợp
    if (!activeCycle && cycles.length > 0) {
      activeCycle = cycles[cycles.length - 1];
      await db.cycles.update(activeCycle.id, { is_active: true, is_synced: 0, updated_at: nowStr });
      await db.outbox.add({
        action: 'update',
        table_name: 'cycles',
        record_id: activeCycle.id,
        payload: { is_active: true, updated_at: nowStr, is_synced: 0 },
        created_at: nowStr
      });
    }

    if (activeCycle) {
      const activeEndDate = new Date(activeCycle.end_date || '');
      
      // Nếu chu kỳ active hiện tại ĐÃ HẾT HẠN (hôm nay vượt quá end_date)
      if (today > activeEndDate) {
        const oldActiveId = activeCycle.id;
        const nextNumber = activeCycle.number + 1;
        
        // Tìm hoặc tạo chu kỳ tiếp theo
        let nextCycle = cycles.find(c => c.number === nextNumber);
        
        if (!nextCycle) {
          // Tạo chu kỳ kế tiếp gối đầu
          const id = uuidv4();
          let cycleStart = new Date(activeEndDate);
          cycleStart.setDate(cycleStart.getDate() + 1);
          cycleStart.setHours(0, 0, 0, 0);

          const cycleEnd = new Date(cycleStart);
          cycleEnd.setDate(cycleEnd.getDate() + (durationWeeks * 7) - 1);
          cycleEnd.setHours(23, 59, 59, 999);

          nextCycle = {
            id,
            user_id: 'local-user',
            number: nextNumber,
            name: `Cycle ${nextNumber}`,
            is_active: false,
            start_date: cycleStart.toISOString(),
            end_date: cycleEnd.toISOString(),
            created_at: nowStr,
            updated_at: nowStr,
            is_synced: 0,
            is_deleted: 0
          };

          await db.cycles.add(nextCycle);
          await db.outbox.add({
            action: 'create',
            table_name: 'cycles',
            record_id: id,
            payload: nextCycle,
            created_at: nowStr
          });
        }

        // Tắt kích hoạt chu kỳ cũ
        await db.cycles.update(oldActiveId, { is_active: false, is_synced: 0, updated_at: nowStr });
        await db.outbox.add({
          action: 'update',
          table_name: 'cycles',
          record_id: oldActiveId,
          payload: { is_active: false, updated_at: nowStr, is_synced: 0 },
          created_at: nowStr
        });

        // Kích hoạt chu kỳ mới
        await db.cycles.update(nextCycle.id, { is_active: true, is_synced: 0, updated_at: nowStr });
        await db.outbox.add({
          action: 'update',
          table_name: 'cycles',
          record_id: nextCycle.id,
          payload: { is_active: true, updated_at: nowStr, is_synced: 0 },
          created_at: nowStr
        });

        // Thực hiện tự động chuyển giao task chưa hoàn thành
        if (autoTransfer) {
          const unfinishedIssues = await db.issues
            .where({ cycle_id: oldActiveId, is_deleted: 0 })
            .filter(i => i.status !== 'done' && i.status !== 'canceled')
            .toArray();

          for (const issue of unfinishedIssues) {
            await db.issues.update(issue.id, { cycle_id: nextCycle.id, is_synced: 0, updated_at: nowStr });
            await db.outbox.add({
              action: 'update',
              table_name: 'issues',
              record_id: issue.id,
              payload: { cycle_id: nextCycle.id, updated_at: nowStr, is_synced: 0 },
              created_at: nowStr
            });
          }
        }
        
        triggerSync();
        // Gọi lại đệ quy để đảm bảo sinh đủ các chu kỳ tương lai gối đầu tiếp theo
        setTimeout(() => runAutoCycleEngine(), 100);
        return;
      }

      // 4. Đảm bảo luôn duy trì ĐỦ ít nhất 2 chu kỳ tương lai (Upcoming Cycles) gối đầu
      const currentNumber = activeCycle.number;
      const latestCycle = cycles[cycles.length - 1];
      const neededUpcomingCount = 2; // duy trì 2 chu kỳ tương lai
      const currentMaxNumber = latestCycle.number;

      if (currentMaxNumber < currentNumber + neededUpcomingCount) {
        let cycleStart = new Date(latestCycle.end_date || '');
        cycleStart.setDate(cycleStart.getDate() + 1);
        cycleStart.setHours(0, 0, 0, 0);

        for (let nextNum = currentMaxNumber + 1; nextNum <= currentNumber + neededUpcomingCount; nextNum++) {
          const id = uuidv4();
          const cycleEnd = new Date(cycleStart);
          cycleEnd.setDate(cycleEnd.getDate() + (durationWeeks * 7) - 1);
          cycleEnd.setHours(23, 59, 59, 999);

          const newCycle: LocalCycle = {
            id,
            user_id: 'local-user',
            number: nextNum,
            name: `Cycle ${nextNum}`,
            is_active: false,
            start_date: cycleStart.toISOString(),
            end_date: cycleEnd.toISOString(),
            created_at: nowStr,
            updated_at: nowStr,
            is_synced: 0,
            is_deleted: 0
          };

          await db.cycles.add(newCycle);
          await db.outbox.add({
            action: 'create',
            table_name: 'cycles',
            record_id: id,
            payload: newCycle,
            created_at: nowStr
          });

          cycleStart = new Date(cycleEnd);
          cycleStart.setDate(cycleStart.getDate() + 1);
          cycleStart.setHours(0, 0, 0, 0);
        }
        triggerSync();
      }
    }
  });
}

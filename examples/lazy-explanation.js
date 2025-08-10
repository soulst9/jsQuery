/* jshint esversion: 6 */
// 지연 평가 시스템 상세 설명 및 데모

const JSQuery = require('../index');

console.log('🔍 지연 평가 (Lazy Evaluation) 상세 설명\n');

// ==============================
// 1. 전통적 방식 vs 지연 평가
// ==============================
console.log('1️⃣ 전통적 방식 vs 지연 평가 비교\n');

const jsQuery = new JSQuery({ performance: true });

console.log('📝 전통적 즉시 평가 방식:');
console.log('─'.repeat(40));

const start1 = process.hrtime.bigint();

// 즉시 평가: 모든 쿼리가 즉시 컴파일됨
const query1 = jsQuery.selectQuery({
  select: ['id', 'name'],
  from: { table: 'users' }
}); // ← 여기서 즉시 컴파일

const query2 = jsQuery.selectQuery({
  select: ['id', 'title'],  
  from: { table: 'posts' }
}); // ← 여기서 즉시 컴파일

const query3 = jsQuery.selectQuery({
  select: ['count(*)', JSQuery.fn('avg', 'rating', 'avg_rating')],
  from: { table: 'reviews' }
}); // ← 여기서 즉시 컴파일

const end1 = process.hrtime.bigint();
const time1 = Number(end1 - start1) / 1000000;

console.log(`✅ Query 1: ${query1}`);
console.log(`✅ Query 2: ${query2}`);
console.log(`✅ Query 3: ${query3}`);
console.log(`⏱️  총 컴파일 시간: ${time1.toFixed(2)}ms`);
console.log(`📊 3개 쿼리 모두 즉시 컴파일됨\n`);

console.log('⚡ 지연 평가 방식:');
console.log('─'.repeat(40));

const start2 = process.hrtime.bigint();

// 지연 평가: 쿼리 객체만 생성, 컴파일은 안함
const lazyQuery1 = jsQuery.lazy().select({
  select: ['id', 'name'],
  from: { table: 'users' }
}); // ← 컴파일 안함, 객체만 생성

const lazyQuery2 = jsQuery.lazy().select({
  select: ['id', 'title'],
  from: { table: 'posts' }
}); // ← 컴파일 안함, 객체만 생성

const lazyQuery3 = jsQuery.lazy().select({
  select: ['count(*)', JSQuery.fn('avg', 'rating', 'avg_rating')],
  from: { table: 'reviews' }
}); // ← 컴파일 안함, 객체만 생성

const end2 = process.hrtime.bigint();
const time2 = Number(end2 - start2) / 1000000;

console.log(`💤 LazyQuery 1 생성됨 (컴파일 안됨)`);
console.log(`💤 LazyQuery 2 생성됨 (컴파일 안됨)`);  
console.log(`💤 LazyQuery 3 생성됨 (컴파일 안됨)`);
console.log(`⏱️  객체 생성 시간: ${time2.toFixed(2)}ms`);
console.log(`📊 ${((time1 - time2) / time1 * 100).toFixed(1)}% 시간 절약!\n`);

// ==============================
// 2. 실제 사용할 때만 컴파일
// ==============================
console.log('2️⃣ 실제 사용 시에만 컴파일\n');

console.log('상황: lazyQuery1만 실제로 사용한다고 가정');

const compileStart = process.hrtime.bigint();
const actualSQL = lazyQuery1.toSql(); // ← 이때 처음으로 컴파일됨!
const compileEnd = process.hrtime.bigint();
const compileTime = Number(compileEnd - compileStart) / 1000000;

console.log(`🔥 실제 SQL: ${actualSQL}`);
console.log(`⏱️  컴파일 시간: ${compileTime.toFixed(2)}ms`);
console.log(`📊 lazyQuery1만 컴파일됨, 나머지 2개는 여전히 미컴파일\n`);

console.log('LazyQuery 상태 확인:');
console.log(`Query 1 - 컴파일됨: ${lazyQuery1.getStats().compiled}`);
console.log(`Query 2 - 컴파일됨: ${lazyQuery2.getStats().compiled}`);
console.log(`Query 3 - 컴파일됨: ${lazyQuery3.getStats().compiled}\n`);

// ==============================
// 3. 메서드 체이닝 최적화
// ==============================
console.log('3️⃣ 메서드 체이닝 최적화\n');

console.log('전통적 방식 - 각 단계마다 재컴파일:');
console.log('─'.repeat(45));

const traditionalStart = process.hrtime.bigint();

// 각 단계마다 새로운 쿼리 생성하고 컴파일
let step1 = jsQuery.selectQuery({
  select: ['id', 'name', 'email'],
  from: { table: 'users' }
});

let step2 = jsQuery.selectQuery({
  select: ['id', 'name', 'email'],
  from: { table: 'users' },
  where: { active: 1 }
});

let step3 = jsQuery.selectQuery({
  select: ['id', 'name', 'email'],
  from: { table: 'users' },
  where: { active: 1 },
  orderby: ['created_at DESC']
});

let step4 = jsQuery.selectQuery({
  select: ['id', 'name', 'email'],
  from: { table: 'users' },
  where: { active: 1 },
  orderby: ['created_at DESC'],
  limit: { offset: 0, count: 10 }
});

const traditionalEnd = process.hrtime.bigint();
const traditionalTime = Number(traditionalEnd - traditionalStart) / 1000000;

console.log(`⏱️  4번의 컴파일 시간: ${traditionalTime.toFixed(2)}ms\n`);

console.log('지연 평가 방식 - 체이닝 후 한 번만 컴파일:');
console.log('─'.repeat(50));

const lazyStart = process.hrtime.bigint();

// 체이닝으로 수정하지만 컴파일은 안함
const chainedQuery = jsQuery.lazy()
  .select({
    select: ['id', 'name', 'email'],
    from: { table: 'users' }
  })
  .where({ active: 1 })        // 컴파일 안함
  .orderBy(['created_at DESC']) // 컴파일 안함
  .limit(0, 10);               // 컴파일 안함

const lazyMiddle = process.hrtime.bigint();
const lazyChainTime = Number(lazyMiddle - lazyStart) / 1000000;

// 최종적으로 한 번만 컴파일
const finalSQL = chainedQuery.toSql();

const lazyEnd = process.hrtime.bigint();
const lazyCompileTime = Number(lazyEnd - lazyMiddle) / 1000000;
const lazyTotalTime = Number(lazyEnd - lazyStart) / 1000000;

console.log(`📝 체이닝 시간: ${lazyChainTime.toFixed(2)}ms (컴파일 없음)`);
console.log(`🔥 최종 컴파일: ${lazyCompileTime.toFixed(2)}ms`);
console.log(`⏱️  총 시간: ${lazyTotalTime.toFixed(2)}ms`);
console.log(`📊 ${((traditionalTime - lazyTotalTime) / traditionalTime * 100).toFixed(1)}% 시간 절약!`);
console.log(`🎯 최종 SQL: ${finalSQL}\n`);

// ==============================
// 4. 조건부 실행 최적화
// ==============================
console.log('4️⃣ 조건부 실행 최적화\n');

console.log('시나리오: 조건에 따라 다른 쿼리를 실행');

// 여러 쿼리를 lazy로 준비
const userQuery = jsQuery.lazy().select({
  select: ['*'],
  from: { table: 'users' }
});

const adminQuery = jsQuery.lazy().select({
  select: ['id', 'name', 'role', 'permissions'],
  from: { table: 'users' },
  where: { role: 'admin' }
});

const reportQuery = jsQuery.lazy().select({
  select: [
    JSQuery.fn('count', '*', 'total_users'),
    JSQuery.fn('count', 'CASE WHEN active = 1 THEN 1 END', 'active_users'),
    JSQuery.fn('avg', 'login_count', 'avg_logins')
  ],
  from: { table: 'users' }
});

console.log('📋 3개의 LazyQuery 준비 완료 (컴파일 안됨)');

// 실제 조건부 실행
const userType = 'admin'; // 예시 조건

let executedQuery;
const conditionStart = process.hrtime.bigint();

if (userType === 'admin') {
  executedQuery = adminQuery.toSql(); // 이때만 컴파일
} else if (userType === 'report') {
  executedQuery = reportQuery.toSql(); // 사용 안됨
} else {
  executedQuery = userQuery.toSql(); // 사용 안됨
}

const conditionEnd = process.hrtime.bigint();
const conditionTime = Number(conditionEnd - conditionStart) / 1000000;

console.log(`✅ 실행된 쿼리: ${executedQuery}`);
console.log(`⏱️  실행 시간: ${conditionTime.toFixed(2)}ms`);
console.log(`📊 필요한 쿼리 1개만 컴파일, 나머지 2개는 미컴파일\n`);

// ==============================
// 5. 캐싱과의 조합 효과
// ==============================
console.log('5️⃣ 캐싱과의 조합 효과\n');

// 같은 lazy 쿼리를 여러 번 호출
console.log('동일한 LazyQuery를 3번 호출:');

const cacheTestQuery = jsQuery.lazy().select({
  select: ['id', 'name'],
  from: { table: 'products' },
  where: { category: 'electronics' }
});

const call1Start = process.hrtime.bigint();
const sql1 = cacheTestQuery.toSql(); // 첫 번째: 컴파일
const call1End = process.hrtime.bigint();

const call2Start = process.hrtime.bigint();
const sql2 = cacheTestQuery.toSql(); // 두 번째: 캐시 사용
const call2End = process.hrtime.bigint();

const call3Start = process.hrtime.bigint();
const sql3 = cacheTestQuery.toSql(); // 세 번째: 캐시 사용
const call3End = process.hrtime.bigint();

const time_call1 = Number(call1End - call1Start) / 1000000;
const time_call2 = Number(call2End - call2Start) / 1000000;
const time_call3 = Number(call3End - call3Start) / 1000000;

console.log(`1차 호출 (컴파일): ${time_call1.toFixed(4)}ms`);
console.log(`2차 호출 (캐시): ${time_call2.toFixed(4)}ms`);
console.log(`3차 호출 (캐시): ${time_call3.toFixed(4)}ms`);
console.log(`📊 2,3차 호출은 ${((time_call1 - time_call2) / time_call1 * 100).toFixed(1)}% 빨라짐!\n`);

// LazyQuery 상태 확인
const queryStats = cacheTestQuery.getStats();
console.log('LazyQuery 통계:');
console.log(`  컴파일됨: ${queryStats.compiled}`);
console.log(`  호출 횟수: ${queryStats.accessCount}`);
console.log(`  컴파일 시간: ${queryStats.compilationTime.toFixed(2)}ms`);
console.log(`  마지막 접근: ${new Date(queryStats.lastAccessed).toLocaleTimeString()}\n`);

// ==============================
// 6. 메모리 효율성
// ==============================
console.log('6️⃣ 메모리 효율성\n');

console.log('대량 쿼리 생성 테스트 (1000개):');

const memStart = process.memoryUsage();
const lazyQueries = [];

// 1000개의 lazy 쿼리 생성 (컴파일 안됨)
for (let i = 0; i < 1000; i++) {
  lazyQueries.push(jsQuery.lazy().select({
    select: [`field_${i}`, `value_${i}`],
    from: { table: `table_${i}` },
    where: { [`id_${i}`]: i }
  }));
}

const memMiddle = process.memoryUsage();

// 100개만 실제 사용 (컴파일)
const compiledSQLs = [];
for (let i = 0; i < 100; i++) {
  compiledSQLs.push(lazyQueries[i].toSql());
}

const memEnd = process.memoryUsage();

const memoryAfterCreate = (memMiddle.heapUsed - memStart.heapUsed) / 1024 / 1024;
const memoryAfterCompile = (memEnd.heapUsed - memMiddle.heapUsed) / 1024 / 1024;
const totalMemory = (memEnd.heapUsed - memStart.heapUsed) / 1024 / 1024;

console.log(`📊 1000개 LazyQuery 생성: +${memoryAfterCreate.toFixed(2)}MB`);
console.log(`📊 100개 컴파일: +${memoryAfterCompile.toFixed(2)}MB`);
console.log(`📊 총 메모리 사용: ${totalMemory.toFixed(2)}MB`);
console.log(`💡 900개는 컴파일 안되어 메모리 절약!`);

// 정리
jsQuery.destroy();

console.log('\n🎯 지연 평가의 핵심 이점:');
console.log('  ✅ 불필요한 연산 제거 → CPU 절약');
console.log('  ✅ 메모리 효율성 → RAM 절약'); 
console.log('  ✅ 조건부 실행 최적화 → 성능 향상');
console.log('  ✅ 캐싱과 조합 시 극대 효과');
console.log('  ✅ 복잡한 쿼리 체이닝 최적화');
console.log('  ✅ 대규모 애플리케이션 확장성');

console.log('\n🎮 실제 사용 예시:');
console.log('  💼 대시보드: 탭별로 다른 쿼리, 보지 않는 탭은 컴파일 안됨');
console.log('  🔍 검색: 필터 조건 변경 시마다 재컴파일 방지');
console.log('  📊 리포트: 조건부 차트, 사용하지 않는 차트는 미컴파일');
console.log('  🎯 API: 권한별 다른 쿼리, 해당 권한만 컴파일');
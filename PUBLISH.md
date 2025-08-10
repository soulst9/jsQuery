# Publishing Guide for jsQuery

이 가이드는 jsQuery 패키지를 npm에 배포하는 과정을 설명합니다.

## 사전 준비

### 1. npm 계정 설정
```bash
# npm 계정 로그인
npm login

# 현재 사용자 확인
npm whoami
```

### 2. 패키지명 변경 (필요시)
현재 패키지명은 `@jsquery/core`입니다. 스코프 없는 패키지명을 원한다면:

```bash
# package.json에서 name 변경
"name": "jsquery"
```

참고: 스코프 없는 패키지명은 이미 사용 중일 수 있으니 확인 필요:
```bash
npm view jsquery
```

## 배포 과정

### 1. 테스트 실행
```bash
# 모든 테스트 실행
npm run test:all

# 성능 테스트 포함
npm run benchmark
```

### 2. 버전 업데이트
```bash
# 패치 버전 (0.3.0 → 0.3.1)
npm run version:patch

# 마이너 버전 (0.3.0 → 0.4.0)  
npm run version:minor

# 메이저 버전 (0.3.0 → 1.0.0)
npm run version:major
```

### 3. 배포 테스트
```bash
# 패키징 테스트
npm run pack:dry-run

# 배포 시뮬레이션
npm run publish:dry-run
```

### 4. 실제 배포
```bash
# npm 패키지 배포
npm publish

# 처음 스코프 패키지 배포 시
npm publish --access public
```

## 설치 테스트

배포 후 설치 테스트:

```bash
# 새로운 디렉토리에서 테스트
mkdir test-install
cd test-install
npm init -y

# 배포된 패키지 설치
npm install @jsquery/core
# 또는 (스코프 없는 경우)
npm install jsquery
```

## 사용 예제

설치 후 테스트:

```javascript
// test.js
const JSQuery = require('@jsquery/core');

const jsQuery = new JSQuery({ performance: true });

const query = jsQuery.selectQuery({
  select: ['id', 'name'],
  from: { table: 'users' },
  where: { active: 1 }
});

console.log('쿼리 결과:', query);

// 성능 통계 확인
const stats = jsQuery.getPerformanceStats();
console.log('캐시 적중률:', stats.cache.sql.hitRate);
```

```bash
node test.js
```

## 트러블슈팅

### 배포 실패 시

1. **권한 오류**
   ```bash
   npm login
   npm publish --access public
   ```

2. **버전 충돌**
   ```bash
   npm version patch
   npm publish
   ```

3. **패키지명 중복**
   - package.json에서 다른 이름 사용
   - 스코프 사용: `@your-username/jsquery`

### 패키지 업데이트

```bash
# 코드 수정 후
npm run test:all
npm run version:patch
npm publish
```

## 배포 체크리스트

- [ ] 모든 테스트 통과
- [ ] README.md 업데이트
- [ ] CHANGELOG.md 업데이트  
- [ ] 버전 번호 적절히 증가
- [ ] npm 로그인 상태 확인
- [ ] 배포 테스트 실행
- [ ] 실제 배포 실행
- [ ] 설치 및 사용 테스트

## 결과

성공적으로 배포되면:

```bash
npm install @jsquery/core
```

명령어로 누구나 설치할 수 있습니다!
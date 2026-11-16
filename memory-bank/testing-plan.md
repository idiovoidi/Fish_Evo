# Testing & Validation Plan

## 1. Unit Tests (Jest)

| Area            | What to Test                                |
|-----------------|---------------------------------------------|
| Components      | Default values, mutation functions          |
| Systems         | Movement math, hunger progression           |
| Factories       | Correct component attachment                |
| Utils           | Error wrapper returns / logs                |

## 2. Integration Scenarios

1. *Fish Eats Food* – spawn fish at low energy near food, assert energy increases.
2. *Shark Eats Fish* – spawn shark & fish, ensure fish entity count decreases.
3. *Breeding Event* – two adults with high energy produce offspring entity.

## 3. Regression Benchmarks

* 300 entities for 60 seconds – FPS remains ≥ 55.
* Save & Load cycle – entity count identical, traits preserved.

## 4. Continuous Integration

* GitHub Actions workflow: `npm test` + ESLint.

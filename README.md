# Запуск приложения

1. **Установить зависимости:**

```bash
npm install
cd frontend && npm install
cd ..
```

2. **Запустить локальный блокчейн:**

```bash
npx hardhat node
```

3. **Развернуть смарт-контракты:**

```bash
npx hardhat run scripts/deploy.cjs --network localhost
```

4. **Запустить frontend:**

```bash
cd frontend
npm run dev
```

Приложение будет доступно на: [http://localhost:5173](http://localhost:5173)

---


5. **Создание тестовой сети блокчейна:**

   Необходимо также создать тестовую сеть блокчейна в Metamask:
   - URL-адрес RPC: 127.0.0.1:8585
   - ID-блокчейна: 1337

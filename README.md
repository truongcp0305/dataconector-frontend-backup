# frontend

Symper Frontend

**Cài đặt:**

**I. Các ứng dụng cần có**

1. VSCode
2. Nodejs
3. Prettier(version 2.0.2)
4. Git

**II. Các công cụ hỗ trợ (Cài trong extensions visual code)**

1. Vetur(Syntax-highlighting Snippet Linting / Error Checking Formatting Auto Completion Debugging)
2. Vue VSCode Snippets

**III. Các bước cài** (Nên thực hiện trong terminal của vscode)

1. Clone/Pull code từ github về
2. Cài vue cli service: `npm install -g @vue/cli`
3. Cài các package của project: `npm install`
4. Bật chế độ tự động format khi lưu file: ấn tổ hợp phím `Ctrl` + `,` --> chọn `formatting` --> tick chọn vào `Format on Save`

**IV. Các bước cài Prettier**

1. Cài Prettier: `npm install --save-dev --save-exact prettier`
2. Tạo folder(Cùng cấp với folder src) .vscode(Nếu chưa có) -> tạo file setting.json có nội dung:
   `{ "editor.formatOnSave": true, "editor.defaultFormatter": "esbenp.prettier-vscode" }`

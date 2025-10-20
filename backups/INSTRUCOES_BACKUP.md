# 📁 Instruções para Organização dos Backups

## 🎯 **Como funciona o backup automático:**

### 🔄 **Backup Automático:**
- **Toda vez** que você abrir o sistema (index.html)
- **Arquivo baixado** automaticamente para Downloads
- **Nome**: `BackupAuto_YYYY-MM-DD_HH-MM-SS.json`
- **Salvo também** no navegador (localStorage)

## 📂 **Como organizar os backups:**

### 1. **Mova os arquivos para a pasta backups:**
```
📁 SisRealDriver/
├── 📁 backups/          ← Mova os arquivos aqui
│   ├── BackupAuto_2024-01-15_10-30-45.json
│   ├── BackupAuto_2024-01-15_14-20-30.json
│   └── ...
├── index.html
├── script.js
└── ...
```

### 2. **Organize por data:**
- **Crie subpastas** por mês: `2024-01/`, `2024-02/`, etc.
- **Mantenha** apenas os backups mais recentes
- **Delete** backups antigos (mais de 30 dias)

### 3. **Backup importante:**
- **Antes de mudanças** importantes, faça backup manual
- **Guarde** em local seguro (nuvem, HD externo)
- **Teste** a restauração periodicamente

## ⚠️ **Importante:**

### 🔒 **Limitações do navegador:**
- **Não é possível** salvar diretamente na pasta do programa
- **Arquivos vão** para pasta Downloads
- **Você deve mover** manualmente para pasta backups

### 💡 **Dica:**
- **Configure** o navegador para sempre perguntar onde salvar
- **Escolha** a pasta backups como destino padrão
- **Organize** os arquivos regularmente

## 🛡️ **Segurança:**

- ✅ **Backup automático** a cada execução
- ✅ **Backup no navegador** para emergências
- ✅ **Arquivo físico** para backup seguro
- ✅ **Múltiplas camadas** de proteção

## 📋 **Checklist de manutenção:**

- [ ] **Mover** arquivos de Downloads para pasta backups
- [ ] **Organizar** por data/mês
- [ ] **Deletar** backups antigos (>30 dias)
- [ ] **Testar** restauração mensalmente
- [ ] **Fazer backup** antes de mudanças importantes

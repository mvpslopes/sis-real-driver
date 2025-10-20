# SisRealDriver - Sistema de Controle de Motoristas e Veículos

Sistema web completo para controle de motoristas e veículos, desenvolvido com HTML, CSS e JavaScript puro. Funciona offline e utiliza planilhas Excel como banco de dados.

## 🚀 Características

- **Interface Moderna**: Design responsivo e intuitivo
- **Funciona Offline**: Não precisa de servidor ou internet
- **Banco de Dados Excel**: Usa planilhas .xlsx para armazenar dados
- **Sistema Completo**: Módulos para motoristas, veículos, diárias, manutenções e financeiro
- **Dashboard**: Estatísticas e gráficos em tempo real
- **Backup Automático**: Exportação e importação de dados

## 📋 Funcionalidades

### 👥 Motoristas
- Cadastro completo (nome, CPF, CNH, telefone, endereço, status)
- Edição e exclusão de registros
- Filtros por status e busca por nome/CPF

### 🚗 Veículos
- Cadastro de veículos (modelo, marca, placa, ano, cor, status)
- Controle de status (Ativo, Inativo, Em Manutenção)
- Filtros e busca avançada

### 📅 Diárias
- Controle de diárias por motorista
- Gestão de status (Pendente, Pago, Cancelado)
- Filtros por data e status

### 🔧 Manutenções
- Registro de manutenções por veículo
- Tipos: Preventiva, Corretiva, Emergencial
- Controle de custos e descrições

### 💰 Financeiro
- Controle de receitas e despesas
- Categorização de transações
- Relatórios financeiros

### 📊 Dashboard
- Estatísticas em tempo real
- Gráficos de receitas vs despesas
- Controle de manutenções por mês

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura semântica
- **CSS3**: Design moderno com gradientes e animações
- **JavaScript ES6+**: Lógica da aplicação
- **SheetJS**: Manipulação de planilhas Excel
- **LocalStorage**: Armazenamento local de dados
- **File API**: Upload e download de arquivos

## 📁 Estrutura do Projeto

```
SisRealDriver/
├── index.html          # Página principal
├── styles.css          # Estilos CSS
├── script.js           # Lógica JavaScript
├── data/               # Pasta para planilhas (criada automaticamente)
└── README.md           # Este arquivo
```

## 🚀 Como Usar

1. **Abrir o Sistema**: Abra o arquivo `index.html` em qualquer navegador moderno
2. **Dados Iniciais**: O sistema vem com dados de exemplo para demonstração
3. **Navegação**: Use as abas para acessar diferentes módulos
4. **Adicionar Dados**: Clique nos botões "Novo" para adicionar registros
5. **Editar**: Clique no ícone de edição em qualquer linha da tabela
6. **Filtrar**: Use os campos de busca e filtros para encontrar registros
7. **Backup**: Use os botões de exportar/importar para fazer backup dos dados

## 💾 Backup e Restauração

### Exportar Dados
- Clique no botão "Backup" no cabeçalho
- Um arquivo Excel será baixado com todos os dados
- O arquivo contém uma planilha para cada módulo

### Importar Dados
- Clique no botão "Importar" no cabeçalho
- Selecione um arquivo Excel válido
- Os dados serão carregados automaticamente

## 🎨 Interface

### Design Moderno
- Gradientes e efeitos visuais
- Animações suaves
- Ícones Font Awesome
- Cores harmoniosas

### Responsivo
- Funciona em desktop, tablet e mobile
- Layout adaptativo
- Navegação otimizada para touch

### Usabilidade
- Formulários intuitivos
- Validação de dados
- Mensagens de feedback
- Modais para edição

## 📊 Dados de Exemplo

O sistema inclui dados de exemplo:
- 2 motoristas ativos
- 2 veículos cadastrados
- Diárias de exemplo
- Manutenções registradas
- Transações financeiras

## 🔧 Personalização

### Adicionar Novos Campos
1. Edite o HTML para adicionar campos no formulário
2. Atualize o JavaScript para processar os novos campos
3. Modifique a renderização das tabelas

### Alterar Cores
- Edite as variáveis CSS no arquivo `styles.css`
- Os gradientes principais estão definidos no header e botões

### Adicionar Novos Módulos
1. Crie nova aba no HTML
2. Adicione formulário modal
3. Implemente CRUD no JavaScript
4. Atualize sistema de exportação

## 🐛 Solução de Problemas

### Dados Não Salvam
- Verifique se o navegador suporta LocalStorage
- Limpe o cache do navegador
- Verifique o console para erros JavaScript

### Importação Falha
- Verifique se o arquivo Excel está no formato correto
- Certifique-se de que as planilhas têm os nomes corretos
- Verifique se os dados estão na primeira linha

### Interface Quebrada
- Verifique se todos os arquivos estão no mesmo diretório
- Certifique-se de que o navegador suporta CSS3
- Verifique a conexão com CDN do Font Awesome

## 📝 Licença

Este projeto é de código aberto e pode ser usado livremente para fins comerciais e pessoais.

## 🤝 Contribuições

Contribuições são bem-vindas! Sinta-se à vontade para:
- Reportar bugs
- Sugerir melhorias
- Adicionar novas funcionalidades
- Melhorar a documentação

## 📞 Suporte

Para dúvidas ou suporte:
- Verifique a documentação
- Consulte os comentários no código
- Teste com dados de exemplo

---

**SisRealDriver** - Sistema completo para controle de motoristas e veículos 🚛✨

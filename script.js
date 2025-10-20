// SisRealDriver - Sistema de Controle de Motoristas e Veículos
// Sistema completo com planilhas Excel como banco de dados

class SisRealDriver {
    constructor() {
        console.log('🏗️ Construtor SisRealDriver chamado');
        this.data = {
            motoristas: [],
            veiculos: [],
            diarias: [],
            manutencoes: [],
            financeiro: [],
            contratos: []
        };
        
        this.pendingDelete = null;
        
        this.currentEditId = null;
        this.currentEditType = null;
        
        this.init();
    }

    init() {
        console.log('🔧 Inicializando SisRealDriver...');
        this.setupEventListeners();
        this.loadData();
        this.updateDashboard();
        this.setupCharts();
        
        // Aguardar carregamento dos dados antes de configurar relatórios
        setTimeout(() => {
            console.log('📊 Dados carregados - Motoristas:', this.data.motoristas.length);
            console.log('📊 Dados carregados - Contratos:', this.data.contratos.length);
            console.log('📊 Dados carregados - Diárias:', this.data.diarias.length);
            this.setupRelatorios();
        }, 300);
        
        console.log('✅ SisRealDriver inicializado com sucesso');
    }

    setupEventListeners() {
        // Navigation tabs
        document.querySelectorAll('.nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Form submissions - event listeners diretos
        this.setupFormListeners();

        // Search and filters
        this.setupFilters();

        // File input for backup restore
        document.getElementById('backup-file-input').addEventListener('change', (e) => {
            this.handleBackupRestore(e.target.files[0]);
        });

        // Auto backup on every execution
        this.performAutoBackup();

        // Event delegation for modal close buttons
        this.setupModalCloseListeners();

        // Event delegation for new item buttons
        this.setupNewItemListeners();
        
        // Debug: verificar se os formulários existem
        this.debugFormElements();
        
        // Limpar dados corrompidos se necessário
        this.checkAndFixDataIntegrity();
    }

    setupFilters() {
        // Motoristas filters
        document.getElementById('search-motoristas').addEventListener('input', () => {
            this.filterMotoristas();
        });
        document.getElementById('filter-status-motoristas').addEventListener('change', () => {
            this.filterMotoristas();
        });

        // Veículos filters
        document.getElementById('search-veiculos').addEventListener('input', () => {
            this.filterVeiculos();
        });
        document.getElementById('filter-status-veiculos').addEventListener('change', () => {
            this.filterVeiculos();
        });

        // Diárias filters
        document.getElementById('search-diarias').addEventListener('input', () => {
            this.filterDiarias();
        });
        document.getElementById('filter-date-diarias').addEventListener('change', () => {
            this.filterDiarias();
        });
        document.getElementById('filter-status-diarias').addEventListener('change', () => {
            this.filterDiarias();
        });

        // Manutenções filters
        document.getElementById('search-manutencoes').addEventListener('input', () => {
            this.filterManutencoes();
        });
        document.getElementById('filter-tipo-manutencoes').addEventListener('change', () => {
            this.filterManutencoes();
        });

        // Financeiro filters
        document.getElementById('search-financeiro').addEventListener('input', () => {
            this.filterFinanceiro();
        });
        document.getElementById('filter-tipo-financeiro').addEventListener('change', () => {
            this.filterFinanceiro();
        });
        document.getElementById('filter-categoria-financeiro').addEventListener('change', () => {
            this.filterFinanceiro();
        });

        // Contratos filters
        document.getElementById('search-contratos').addEventListener('input', () => {
            this.filterContratos();
        });
        document.getElementById('filter-status-contratos').addEventListener('change', () => {
            this.filterContratos();
        });
        document.getElementById('filter-vencimento-contratos').addEventListener('change', () => {
            this.filterContratos();
        });

        // Auto-calculate weekly and daily values
        // Cálculo automático removido - valores serão calculados apenas no salvamento
    }

    // Navigation
    switchTab(tabName) {
        // Remove active class from all tabs and contents
        document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));

        // Add active class to selected tab and content
        document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
        document.getElementById(tabName).classList.add('active');

        // Load data for the selected tab
        this.loadTabData(tabName);
    }

    loadTabData(tabName) {
        switch(tabName) {
            case 'dashboard':
                this.updateDashboard();
                break;
            case 'motoristas':
                this.renderMotoristas();
                break;
            case 'veiculos':
                this.renderVeiculos();
                this.populateVeiculosMotoristaSelect();
                break;
            case 'diarias':
                this.renderDiarias();
                this.populateMotoristasSelect();
                this.populateVeiculosSelect();
                break;
            case 'manutencoes':
                this.renderManutencoes();
                this.populateVeiculosManutencaoSelect();
                break;
            case 'contratos':
                this.renderContratos();
                this.populateContratoSelects();
                break;
            case 'relatorios':
                this.setupRelatorios();
                break;
            case 'financeiro':
                this.renderFinanceiro();
                break;
        }
    }

    // Função utilitária para formatar datas corretamente
    formatDate(dateString) {
        if (!dateString) return '';
        
        // Se a data já está no formato correto (DD/MM/YYYY), retorna como está
        if (dateString.includes('/')) {
            return dateString;
        }
        
        // Se está no formato YYYY-MM-DD, converte corretamente evitando problemas de timezone
        try {
            const [year, month, day] = dateString.split('-');
            const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
            return date.toLocaleDateString('pt-BR');
        } catch (error) {
            console.error('Erro ao formatar data:', dateString, error);
            return dateString; // Retorna a string original em caso de erro
        }
    }

    // Data Management
    loadData() {
        console.log('📊 Carregando dados...');
        // Load from localStorage
        const savedData = localStorage.getItem('sisRealDriverData');
        if (savedData) {
            try {
                this.data = JSON.parse(savedData);
                
                // Garantir que todas as propriedades existam
                if (!this.data.contratos) {
                    this.data.contratos = [];
                }
                if (!this.data.motoristas) {
                    this.data.motoristas = [];
                }
                if (!this.data.veiculos) {
                    this.data.veiculos = [];
                }
                if (!this.data.diarias) {
                    this.data.diarias = [];
                }
                if (!this.data.manutencoes) {
                    this.data.manutencoes = [];
                }
                if (!this.data.financeiro) {
                    this.data.financeiro = [];
                }
                
                console.log('✅ Dados carregados com sucesso:', {
                    motoristas: this.data.motoristas.length,
                    veiculos: this.data.veiculos.length,
                    contratos: this.data.contratos.length,
                    diarias: this.data.diarias.length,
                    manutencoes: this.data.manutencoes.length,
                    financeiro: this.data.financeiro.length
                });
            } catch (error) {
                console.error('Erro ao carregar dados, tentando auto backup...', error);
                // Try to restore from auto backup
                this.tryRestoreFromAutoBackup();
            }
        } else {
            console.log('📝 Nenhum dado salvo encontrado, tentando auto backup...');
            // Try to restore from auto backup first
            this.tryRestoreFromAutoBackup();
        }
    }

    tryRestoreFromAutoBackup() {
        console.log('🔄 Tentando restaurar do auto backup...');
        const autoBackup = localStorage.getItem('sisRealDriverAutoBackup');
        if (autoBackup) {
            try {
                const backupData = JSON.parse(autoBackup);
                this.data = backupData.data;
                console.log('✅ Dados restaurados do auto backup');
                
                // Garantir que todas as propriedades existam
                if (!this.data.contratos) {
                    this.data.contratos = [];
                }
                if (!this.data.motoristas) {
                    this.data.motoristas = [];
                }
                if (!this.data.veiculos) {
                    this.data.veiculos = [];
                }
                if (!this.data.diarias) {
                    this.data.diarias = [];
                }
                if (!this.data.manutencoes) {
                    this.data.manutencoes = [];
                }
                if (!this.data.financeiro) {
                    this.data.financeiro = [];
                }
                
                console.log('✅ Dados restaurados do auto backup:', {
                    motoristas: this.data.motoristas.length,
                    veiculos: this.data.veiculos.length,
                    contratos: this.data.contratos.length,
                    diarias: this.data.diarias.length,
                    manutencoes: this.data.manutencoes.length,
                    financeiro: this.data.financeiro.length
                });
                this.showMessage('Dados restaurados do backup automático', 'success');
            } catch (error) {
                console.error('❌ Erro no auto backup, inicializando com dados de exemplo', error);
                this.initializeSampleData();
            }
        } else {
            console.log('📝 Nenhum auto backup encontrado, inicializando com dados de exemplo...');
            // Initialize with sample data
            this.initializeSampleData();
        }
    }

    saveData() {
        console.log('💾 Salvando dados...');
        // Save to localStorage (primary storage)
        localStorage.setItem('sisRealDriverData', JSON.stringify(this.data));
        console.log('✅ Dados salvos com sucesso');
    }


    saveToExcel() {
        try {
            // Create Excel workbook
            const wb = XLSX.utils.book_new();
            
            // Motoristas sheet
            const motoristasWS = XLSX.utils.json_to_sheet(this.data.motoristas);
            XLSX.utils.book_append_sheet(wb, motoristasWS, 'Motoristas');
            
            // Veículos sheet
            const veiculosWS = XLSX.utils.json_to_sheet(this.data.veiculos);
            XLSX.utils.book_append_sheet(wb, veiculosWS, 'Veículos');
            
            // Diárias sheet
            const diariasWS = XLSX.utils.json_to_sheet(this.data.diarias);
            XLSX.utils.book_append_sheet(wb, diariasWS, 'Diárias');
            
            // Manutenções sheet
            const manutencoesWS = XLSX.utils.json_to_sheet(this.data.manutencoes);
            XLSX.utils.book_append_sheet(wb, manutencoesWS, 'Manutenções');
            
            // Contratos sheet
            const contratosWS = XLSX.utils.json_to_sheet(this.data.contratos);
            XLSX.utils.book_append_sheet(wb, contratosWS, 'Contratos');
            
            // Financeiro sheet
            const financeiroWS = XLSX.utils.json_to_sheet(this.data.financeiro);
            XLSX.utils.book_append_sheet(wb, financeiroWS, 'Financeiro');
            
            // Save to localStorage as base64 for "file storage"
            const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
            const base64 = btoa(String.fromCharCode.apply(null, wbout));
            localStorage.setItem('sisRealDriverExcel', base64);
            
            console.log('Data saved to Excel format in localStorage');
        } catch (error) {
            console.error('Error saving to Excel:', error);
        }
    }

    initializeSampleData() {
        console.log('📝 Inicializando dados de exemplo...');
        this.data = {
            motoristas: [
                {
                    id: 1,
                    nome: 'João Silva',
                    cpf: '123.456.789-00',
                    cnh: '12345678901',
                    telefone: '(11) 99999-9999',
                    endereco: 'Rua das Flores, 123',
                    status: 'Ativo'
                },
                {
                    id: 2,
                    nome: 'Maria Santos',
                    cpf: '987.654.321-00',
                    cnh: '98765432109',
                    telefone: '(11) 88888-8888',
                    endereco: 'Av. Principal, 456',
                    status: 'Ativo'
                }
            ],
            veiculos: [
                {
                    id: 1,
                    modelo: 'Civic',
                    marca: 'Honda',
                    placa: 'ABC-1234',
                    ano: 2020,
                    cor: 'Prata',
                    motoristaId: 1,
                    status: 'Ativo'
                },
                {
                    id: 2,
                    modelo: 'Corolla',
                    marca: 'Toyota',
                    placa: 'XYZ-5678',
                    ano: 2019,
                    cor: 'Branco',
                    motoristaId: 2,
                    status: 'Ativo'
                }
            ],
            diarias: [
                {
                    id: 1,
                    motoristaId: 1,
                    veiculoId: 1,
                    data: '2024-01-15',
                    valor: 150.00,
                    status: 'Pago'
                },
                {
                    id: 2,
                    motoristaId: 2,
                    veiculoId: 2,
                    data: '2024-01-16',
                    valor: 150.00,
                    status: 'Pendente'
                }
            ],
            manutencoes: [
                {
                    id: 1,
                    veiculoId: 1,
                    tipo: 'Preventiva',
                    data: '2024-01-10',
                    valor: 500.00,
                    descricao: 'Troca de óleo e filtros'
                }
            ],
            contratos: [
                {
                    id: 1,
                    veiculoId: 1,
                    motoristaId: 1,
                    dataInicio: '2024-01-01',
                    dataVencimento: '2024-01-31',
                    duracao: 30,
                    valorMensal: 1500.00,
                    valorSemanal: 375.00,
                    valorDiario: 50.00,
                    status: 'Ativo',
                    observacoes: 'Contrato de 30 dias'
                }
            ],
            financeiro: [
                {
                    id: 1,
                    descricao: 'Diária João Silva',
                    valor: 150.00,
                    data: '2024-01-15',
                    tipo: 'Receita',
                    categoria: 'Diárias'
                },
                {
                    id: 2,
                    descricao: 'Manutenção Honda Civic',
                    valor: 500.00,
                    data: '2024-01-10',
                    tipo: 'Despesa',
                    categoria: 'Manutenção'
                }
            ]
        };
        this.saveData();
        console.log('✅ Dados de exemplo inicializados');
    }

    // Motoristas CRUD
    openMotoristaModal(id = null) {
        const modal = document.getElementById('motorista-modal');
        const title = document.getElementById('motorista-modal-title');
        const form = document.getElementById('motorista-form');

        if (id) {
            const motorista = this.data.motoristas.find(m => m.id === id);
            if (motorista) {
                title.textContent = 'Editar Motorista';
                this.currentEditId = id;
                this.currentEditType = 'motorista';
                
                document.getElementById('motorista-nome').value = motorista.nome;
                document.getElementById('motorista-cpf').value = motorista.cpf;
                document.getElementById('motorista-cnh').value = motorista.cnh;
                document.getElementById('motorista-telefone').value = motorista.telefone;
                document.getElementById('motorista-endereco').value = motorista.endereco;
                document.getElementById('motorista-status').value = motorista.status;
            }
        } else {
            title.textContent = 'Novo Motorista';
            this.currentEditId = null;
            this.currentEditType = null;
            form.reset();
        }

        modal.classList.add('show');
    }

    saveMotorista() {
        const formData = {
            nome: document.getElementById('motorista-nome').value.trim(),
            cpf: document.getElementById('motorista-cpf').value.trim(),
            cnh: document.getElementById('motorista-cnh').value.trim(),
            telefone: document.getElementById('motorista-telefone').value.trim(),
            endereco: document.getElementById('motorista-endereco').value.trim(),
            status: document.getElementById('motorista-status').value
        };

        // Validação de campos obrigatórios
        if (!formData.nome) {
            this.showMessage('Nome é obrigatório!', 'error');
            return;
        }

        if (!formData.cpf) {
            this.showMessage('CPF é obrigatório!', 'error');
            return;
        }

        if (!formData.cnh) {
            this.showMessage('CNH é obrigatória!', 'error');
            return;
        }

        if (!formData.telefone) {
            this.showMessage('Telefone é obrigatório!', 'error');
            return;
        }

        if (this.currentEditId) {
            // Update existing
            const index = this.data.motoristas.findIndex(m => m.id === this.currentEditId);
            if (index !== -1) {
                this.data.motoristas[index] = { ...formData, id: this.currentEditId };
            }
        } else {
            // Create new
            const newId = Math.max(...this.data.motoristas.map(m => m.id), 0) + 1;
            this.data.motoristas.push({ ...formData, id: newId });
        }

        console.log('Salvando dados do motorista...');
        this.saveData();
        console.log('Renderizando tabela de motoristas...');
        this.renderMotoristas();
        console.log('Atualizando dashboard...');
        this.updateDashboard();
        console.log('Fechando modal motorista-modal');
        this.closeFormModal('motorista-modal');
        console.log('Mostrando mensagem de sucesso...');
        this.showMessage('Motorista salvo com sucesso!', 'success');
    }

    // Método de exclusão movido para executeDelete() com modal customizado

    renderMotoristas() {
        const tbody = document.querySelector('#motoristas-table tbody');
        tbody.innerHTML = '';

        this.data.motoristas.forEach(motorista => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${motorista.nome}</td>
                <td>${motorista.cpf}</td>
                <td>${motorista.cnh}</td>
                <td>${motorista.telefone}</td>
                <td><span class="status-badge status-${motorista.status.toLowerCase()}">${motorista.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-edit" data-action="edit" data-id="${motorista.id}" data-type="motorista">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-delete" data-action="delete" data-id="${motorista.id}" data-type="motorista">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Adicionar event listeners aos botões
        this.attachActionListeners(tbody);
    }

    filterMotoristas() {
        const search = document.getElementById('search-motoristas').value.toLowerCase();
        const statusFilter = document.getElementById('filter-status-motoristas').value;
        
        const filtered = this.data.motoristas.filter(motorista => {
            const matchesSearch = motorista.nome.toLowerCase().includes(search) ||
                                motorista.cpf.includes(search) ||
                                motorista.cnh.includes(search);
            const matchesStatus = !statusFilter || motorista.status === statusFilter;
            
            return matchesSearch && matchesStatus;
        });

        this.renderFilteredMotoristas(filtered);
    }

    renderFilteredMotoristas(motoristas) {
        const tbody = document.querySelector('#motoristas-table tbody');
        tbody.innerHTML = '';

        motoristas.forEach(motorista => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${motorista.nome}</td>
                <td>${motorista.cpf}</td>
                <td>${motorista.cnh}</td>
                <td>${motorista.telefone}</td>
                <td><span class="status-badge status-${motorista.status.toLowerCase()}">${motorista.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-edit" data-action="edit" data-id="${motorista.id}" data-type="motorista">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-delete" data-action="delete" data-id="${motorista.id}" data-type="motorista">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Adicionar event listeners aos botões
        this.attachActionListeners(tbody);
    }

    // Método para debug dos elementos de formulário
    debugFormElements() {
        const forms = [
            'motorista-form',
            'veiculo-form', 
            'diaria-form',
            'manutencao-form',
            'contrato-form',
            'financeiro-form'
        ];
        
        forms.forEach(formId => {
            const form = document.getElementById(formId);
            if (form) {
                console.log(`✅ Formulário ${formId} encontrado`);
            } else {
                console.error(`❌ Formulário ${formId} NÃO encontrado`);
            }
        });
    }

    // Método para verificar e corrigir integridade dos dados
    checkAndFixDataIntegrity() {
        console.log('🔍 Verificando integridade dos dados...');
        
        // Verificar se this.data existe
        if (!this.data) {
            console.error('❌ this.data está undefined, reinicializando...');
            this.data = {
                motoristas: [],
                veiculos: [],
                diarias: [],
                manutencoes: [],
                financeiro: [],
                contratos: []
            };
            this.saveData();
            return;
        }
        
        // Verificar se todas as propriedades existem
        const requiredProperties = ['motoristas', 'veiculos', 'diarias', 'manutencoes', 'financeiro', 'contratos'];
        let needsFix = false;
        
        requiredProperties.forEach(prop => {
            if (!this.data[prop]) {
                console.warn(`⚠️ Propriedade ${prop} não existe, criando...`);
                this.data[prop] = [];
                needsFix = true;
            } else if (!Array.isArray(this.data[prop])) {
                console.warn(`⚠️ Propriedade ${prop} não é um array, corrigindo...`);
                this.data[prop] = [];
                needsFix = true;
            }
        });
        
        if (needsFix) {
            console.log('🔧 Dados corrigidos, salvando...');
            this.saveData();
        } else {
            console.log('✅ Integridade dos dados verificada com sucesso');
        }
    }

    // Método para configurar event listeners dos formulários
    setupFormListeners() {
        // Aguardar um pouco para garantir que o DOM esteja pronto
        setTimeout(() => {
            this.attachFormListeners();
        }, 100);
    }

    // Método para anexar event listeners aos formulários
    attachFormListeners() {
        // Motorista form
        const motoristaForm = document.getElementById('motorista-form');
        if (motoristaForm) {
            motoristaForm.addEventListener('submit', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Motorista form submit via event listener direto');
                this.saveMotorista();
            });
            console.log('✅ Event listener anexado ao motorista-form');
        }

        // Veículo form
        const veiculoForm = document.getElementById('veiculo-form');
        if (veiculoForm) {
            veiculoForm.addEventListener('submit', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Veículo form submit via event listener direto');
                this.saveVeiculo();
            });
            console.log('✅ Event listener anexado ao veiculo-form');
        }

        // Diária form
        const diariaForm = document.getElementById('diaria-form');
        if (diariaForm) {
            diariaForm.addEventListener('submit', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Diária form submit via event listener direto');
                this.saveDiaria();
            });
            console.log('✅ Event listener anexado ao diaria-form');
        }

        // Event listener para o select de motorista na diária (filtrar veículos)
        const diariaMotoristaSelect = document.getElementById('diaria-motorista');
        if (diariaMotoristaSelect) {
            diariaMotoristaSelect.addEventListener('change', () => {
                console.log('🔄 Motorista selecionado, filtrando veículos...');
                this.populateVeiculosSelect();
            });
            console.log('✅ Event listener anexado ao diaria-motorista select');
        }

        // Manutenção form
        const manutencaoForm = document.getElementById('manutencao-form');
        if (manutencaoForm) {
            manutencaoForm.addEventListener('submit', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Manutenção form submit via event listener direto');
                this.saveManutencao();
            });
            console.log('✅ Event listener anexado ao manutencao-form');
        }

        // Contrato form
        const contratoForm = document.getElementById('contrato-form');
        if (contratoForm) {
            contratoForm.addEventListener('submit', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Contrato form submit via event listener direto');
                this.saveContrato();
            });
            console.log('✅ Event listener anexado ao contrato-form');
        }

        // Financeiro form
        const financeiroForm = document.getElementById('financeiro-form');
        if (financeiroForm) {
            financeiroForm.addEventListener('submit', (e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log('Financeiro form submit via event listener direto');
                this.saveFinanceiro();
            });
            console.log('✅ Event listener anexado ao financeiro-form');
        }
    }

    // Método para configurar event listeners dos botões de novo item
    setupNewItemListeners() {
        document.addEventListener('click', (e) => {
            // Verificar se é um botão de novo item
            if (e.target.closest('button[onclick*="open"]')) {
                e.preventDefault();
                e.stopPropagation();
                
                const button = e.target.closest('button');
                const onclick = button.getAttribute('onclick');
                
                if (onclick) {
                    // Extrair o nome da função do onclick
                    const functionMatch = onclick.match(/open(\w+)Modal/);
                    if (functionMatch) {
                        const functionName = functionMatch[0];
                        
                        switch (functionName) {
                            case 'openMotoristaModal':
                                this.openMotoristaModal();
                                break;
                            case 'openVeiculoModal':
                                this.openVeiculoModal();
                                break;
                            case 'openDiariaModal':
                                this.openDiariaModal();
                                break;
                            case 'openManutencaoModal':
                                this.openManutencaoModal();
                                break;
                            case 'openContratoModal':
                                this.openContratoModal();
                                break;
                            case 'openFinanceiroModal':
                                this.openFinanceiroModal();
                                break;
                        }
                    }
                }
            }
        });
    }

    // Método para configurar event listeners dos botões de fechar modais
    setupModalCloseListeners() {
        // Event delegation para capturar cliques em botões de fechar e cancelar
        document.addEventListener('click', (e) => {
            // Verificar se é um botão de fechar (X)
            if (e.target.classList.contains('close-btn')) {
                e.preventDefault();
                e.stopPropagation();
                const modal = e.target.closest('.modal');
                if (modal) {
                    if (modal.id === 'confirm-modal') {
                        this.closeConfirmModal();
                    } else {
                        this.closeModal(modal.id);
                    }
                }
                return;
            }

            // Verificar se é um botão de cancelar
            if (e.target.classList.contains('btn-secondary') && 
                e.target.textContent.trim() === 'Cancelar') {
                e.preventDefault();
                e.stopPropagation();
                const modal = e.target.closest('.modal');
                if (modal) {
                    if (modal.id === 'confirm-modal') {
                        this.closeConfirmModal();
                    } else {
                        this.closeModal(modal.id);
                    }
                }
                return;
            }

            // Verificar se é um botão de confirmar exclusão
            if (e.target.classList.contains('btn-danger') && 
                e.target.textContent.trim() === 'Excluir') {
                e.preventDefault();
                e.stopPropagation();
                this.executeDelete();
                return;
            }

            // Verificar se é um clique fora do modal (no backdrop)
            if (e.target.classList.contains('modal')) {
                if (e.target.id === 'confirm-modal') {
                    this.closeConfirmModal();
                } else {
                    this.closeModal(e.target.id);
                }
                return;
            }

            // Formulários agora são tratados por event listeners diretos
        });
    }

    // Método para mostrar modal de confirmação
    showConfirmModal(type, id, itemName) {
        const modal = document.getElementById('confirm-modal');
        const title = document.getElementById('confirm-modal-title');
        const message = document.getElementById('confirm-modal-message');
        
        // Limpar qualquer estado anterior
        this.pendingDelete = null;
        
        title.textContent = 'Confirmar Exclusão';
        message.textContent = `Tem certeza que deseja excluir ${itemName}?`;
        
        // Armazenar dados da exclusão
        this.pendingDelete = { type, id, itemName };
        
        // Garantir que o modal seja exibido corretamente
        modal.style.display = 'flex';
        modal.style.visibility = 'visible';
        modal.style.opacity = '1';
        modal.classList.add('show');
    }

    // Método para executar a exclusão confirmada
    executeDelete() {
        if (!this.pendingDelete) return;
        
        const { type, id } = this.pendingDelete;
        
        // Fechar modal primeiro para evitar problemas de UI
        this.closeConfirmModal();
        
        switch (type) {
            case 'motorista':
                this.data.motoristas = this.data.motoristas.filter(m => m.id !== id);
                this.saveData();
                this.renderMotoristas();
                this.updateDashboard();
                this.showMessage('Motorista excluído com sucesso!', 'success');
                break;
            case 'veiculo':
                this.data.veiculos = this.data.veiculos.filter(v => v.id !== id);
                this.saveData();
                this.renderVeiculos();
                this.updateDashboard();
                this.showMessage('Veículo excluído com sucesso!', 'success');
                break;
            case 'diaria':
                this.data.diarias = this.data.diarias.filter(d => d.id !== id);
                this.saveData();
                this.renderDiarias();
                this.updateDashboard();
                this.showMessage('Diária excluída com sucesso!', 'success');
                break;
            case 'manutencao':
                this.data.manutencoes = this.data.manutencoes.filter(m => m.id !== id);
                this.saveData();
                this.renderManutencoes();
                this.updateDashboard();
                this.showMessage('Manutenção excluída com sucesso!', 'success');
                break;
            case 'contrato':
                this.data.contratos = this.data.contratos.filter(c => c.id !== id);
                this.saveData();
                this.renderContratos();
                this.updateDashboard();
                this.showMessage('Contrato excluído com sucesso!', 'success');
                break;
            case 'financeiro':
                this.data.financeiro = this.data.financeiro.filter(f => f.id !== id);
                this.saveData();
                this.renderFinanceiro();
                this.updateDashboard();
                this.showMessage('Transação excluída com sucesso!', 'success');
                break;
        }
        
        // Limpar dados pendentes
        this.pendingDelete = null;
    }

    // Método específico para fechar o modal de confirmação
    closeConfirmModal() {
        const confirmModal = document.getElementById('confirm-modal');
        if (confirmModal) {
            // Remover todas as classes e estilos
            confirmModal.classList.remove('show');
            confirmModal.style.display = 'none';
            confirmModal.style.visibility = 'hidden';
            confirmModal.style.opacity = '0';
            
            // Limpar dados pendentes
            this.pendingDelete = null;
            
            // Forçar re-renderização após um pequeno delay
            setTimeout(() => {
                confirmModal.style.display = '';
                confirmModal.style.visibility = '';
                confirmModal.style.opacity = '';
            }, 150);
        }
    }

    // Método para anexar event listeners aos botões de ação
    attachActionListeners(container) {
        container.addEventListener('click', (e) => {
            const button = e.target.closest('button[data-action]');
            if (!button) return;

            const action = button.dataset.action;
            const id = parseInt(button.dataset.id);
            const type = button.dataset.type;

            switch (type) {
                case 'motorista':
                    if (action === 'edit') {
                        this.openMotoristaModal(id);
                    } else if (action === 'delete') {
                        this.showConfirmModal('motorista', id, 'este motorista');
                    }
                    break;
                case 'veiculo':
                    if (action === 'edit') {
                        this.openVeiculoModal(id);
                    } else if (action === 'delete') {
                        this.showConfirmModal('veiculo', id, 'este veículo');
                    }
                    break;
                case 'diaria':
                    if (action === 'edit') {
                        this.openDiariaModal(id);
                    } else if (action === 'delete') {
                        this.showConfirmModal('diaria', id, 'esta diária');
                    }
                    break;
                case 'manutencao':
                    if (action === 'edit') {
                        this.openManutencaoModal(id);
                    } else if (action === 'delete') {
                        this.showConfirmModal('manutencao', id, 'esta manutenção');
                    }
                    break;
                case 'contrato':
                    if (action === 'edit') {
                        this.openContratoModal(id);
                    } else if (action === 'delete') {
                        this.showConfirmModal('contrato', id, 'este contrato');
                    }
                    break;
                case 'financeiro':
                    if (action === 'edit') {
                        this.openFinanceiroModal(id);
                    } else if (action === 'delete') {
                        this.showConfirmModal('financeiro', id, 'esta transação');
                    }
                    break;
            }
        });
    }

    // Veículos CRUD
    openVeiculoModal(id = null) {
        const modal = document.getElementById('veiculo-modal');
        const title = document.getElementById('veiculo-modal-title');
        const form = document.getElementById('veiculo-form');

        if (id) {
            const veiculo = this.data.veiculos.find(v => v.id === id);
            if (veiculo) {
                title.textContent = 'Editar Veículo';
                this.currentEditId = id;
                this.currentEditType = 'veiculo';
                
                document.getElementById('veiculo-modelo').value = veiculo.modelo;
                document.getElementById('veiculo-marca').value = veiculo.marca;
                document.getElementById('veiculo-placa').value = veiculo.placa;
                document.getElementById('veiculo-ano').value = veiculo.ano;
                document.getElementById('veiculo-cor').value = veiculo.cor;
                document.getElementById('veiculo-motorista').value = veiculo.motoristaId || '';
                document.getElementById('veiculo-status').value = veiculo.status;
            }
        } else {
            title.textContent = 'Novo Veículo';
            this.currentEditId = null;
            this.currentEditType = null;
            form.reset();
        }

        modal.classList.add('show');
    }

    saveVeiculo() {
        const formData = {
            modelo: document.getElementById('veiculo-modelo').value.trim(),
            marca: document.getElementById('veiculo-marca').value.trim(),
            placa: document.getElementById('veiculo-placa').value.trim(),
            ano: parseInt(document.getElementById('veiculo-ano').value),
            cor: document.getElementById('veiculo-cor').value.trim(),
            motoristaId: document.getElementById('veiculo-motorista').value ? parseInt(document.getElementById('veiculo-motorista').value) : null,
            status: document.getElementById('veiculo-status').value
        };

        // Validação de campos obrigatórios
        if (!formData.modelo) {
            this.showMessage('Modelo é obrigatório!', 'error');
            return;
        }

        if (!formData.marca) {
            this.showMessage('Marca é obrigatória!', 'error');
            return;
        }

        if (!formData.placa) {
            this.showMessage('Placa é obrigatória!', 'error');
            return;
        }

        if (!formData.ano || formData.ano < 1900 || formData.ano > new Date().getFullYear() + 1) {
            this.showMessage('Ano inválido!', 'error');
            return;
        }

        if (!formData.cor) {
            this.showMessage('Cor é obrigatória!', 'error');
            return;
        }

        if (this.currentEditId) {
            const index = this.data.veiculos.findIndex(v => v.id === this.currentEditId);
            if (index !== -1) {
                this.data.veiculos[index] = { ...formData, id: this.currentEditId };
            }
        } else {
            const newId = Math.max(...this.data.veiculos.map(v => v.id), 0) + 1;
            this.data.veiculos.push({ ...formData, id: newId });
        }

        this.saveData();
        this.renderVeiculos();
        this.updateDashboard();
        this.closeFormModal('veiculo-modal');
        this.showMessage('Veículo salvo com sucesso!', 'success');
    }

    // Método de exclusão movido para executeDelete() com modal customizado

    renderVeiculos() {
        const tbody = document.querySelector('#veiculos-table tbody');
        tbody.innerHTML = '';

        this.data.veiculos.forEach(veiculo => {
            const motorista = this.data.motoristas.find(m => m.id === veiculo.motoristaId);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${veiculo.modelo}</td>
                <td>${veiculo.marca}</td>
                <td>${veiculo.placa}</td>
                <td>${veiculo.ano}</td>
                <td>${veiculo.cor}</td>
                <td>${motorista ? motorista.nome : 'Não atribuído'}</td>
                <td><span class="status-badge status-${veiculo.status.toLowerCase().replace(' ', '')}">${veiculo.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-edit" data-action="edit" data-id="${veiculo.id}" data-type="veiculo">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-delete" data-action="delete" data-id="${veiculo.id}" data-type="veiculo">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Adicionar event listeners aos botões
        this.attachActionListeners(tbody);
    }

    filterVeiculos() {
        const search = document.getElementById('search-veiculos').value.toLowerCase();
        const statusFilter = document.getElementById('filter-status-veiculos').value;
        
        const filtered = this.data.veiculos.filter(veiculo => {
            const matchesSearch = veiculo.modelo.toLowerCase().includes(search) ||
                                veiculo.marca.toLowerCase().includes(search) ||
                                veiculo.placa.toLowerCase().includes(search);
            const matchesStatus = !statusFilter || veiculo.status === statusFilter;
            
            return matchesSearch && matchesStatus;
        });

        this.renderFilteredVeiculos(filtered);
    }

    renderFilteredVeiculos(veiculos) {
        const tbody = document.querySelector('#veiculos-table tbody');
        tbody.innerHTML = '';

        veiculos.forEach(veiculo => {
            const motorista = this.data.motoristas.find(m => m.id === veiculo.motoristaId);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${veiculo.modelo}</td>
                <td>${veiculo.marca}</td>
                <td>${veiculo.placa}</td>
                <td>${veiculo.ano}</td>
                <td>${veiculo.cor}</td>
                <td>${motorista ? motorista.nome : 'Não atribuído'}</td>
                <td><span class="status-badge status-${veiculo.status.toLowerCase().replace(' ', '')}">${veiculo.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-edit" data-action="edit" data-id="${veiculo.id}" data-type="veiculo">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-delete" data-action="delete" data-id="${veiculo.id}" data-type="veiculo">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Adicionar event listeners aos botões
        this.attachActionListeners(tbody);
    }

    // Diárias CRUD
    openDiariaModal(id = null) {
        const modal = document.getElementById('diaria-modal');
        const title = document.getElementById('diaria-modal-title');
        const form = document.getElementById('diaria-form');

        if (id) {
            const diaria = this.data.diarias.find(d => d.id === id);
            if (diaria) {
                title.textContent = 'Editar Diária';
                this.currentEditId = id;
                this.currentEditType = 'diaria';
                
                document.getElementById('diaria-motorista').value = diaria.motoristaId;
                document.getElementById('diaria-data').value = diaria.data;
                document.getElementById('diaria-valor').value = diaria.valor;
                document.getElementById('diaria-status').value = diaria.status;
                
                // Filtrar veículos baseado no motorista selecionado
                this.populateVeiculosSelect();
                
                // Definir o veículo após filtrar
                document.getElementById('diaria-veiculo').value = diaria.veiculoId;
            }
        } else {
            title.textContent = 'Nova Diária';
            this.currentEditId = null;
            this.currentEditType = null;
            form.reset();
            document.getElementById('diaria-data').value = new Date().toISOString().split('T')[0];
            
            // Carregar todos os veículos ativos para nova diária
            this.populateVeiculosSelect();
        }

        modal.classList.add('show');
    }

    saveDiaria() {
        const formData = {
            motoristaId: parseInt(document.getElementById('diaria-motorista').value),
            veiculoId: parseInt(document.getElementById('diaria-veiculo').value),
            data: document.getElementById('diaria-data').value,
            valor: parseFloat(document.getElementById('diaria-valor').value),
            status: document.getElementById('diaria-status').value
        };

        // Validação de campos obrigatórios
        if (!formData.motoristaId) {
            this.showMessage('Motorista é obrigatório!', 'error');
            return;
        }

        if (!formData.veiculoId) {
            this.showMessage('Veículo é obrigatório!', 'error');
            return;
        }

        if (!formData.data) {
            this.showMessage('Data é obrigatória!', 'error');
            return;
        }

        if (!formData.valor || formData.valor <= 0) {
            this.showMessage('Valor deve ser maior que zero!', 'error');
            return;
        }

        if (this.currentEditId) {
            const index = this.data.diarias.findIndex(d => d.id === this.currentEditId);
            if (index !== -1) {
                this.data.diarias[index] = { ...formData, id: this.currentEditId };
            }
        } else {
            const newId = Math.max(...this.data.diarias.map(d => d.id), 0) + 1;
            this.data.diarias.push({ ...formData, id: newId });
        }

        this.saveData();
        this.renderDiarias();
        this.updateDashboard();
        this.closeFormModal('diaria-modal');
        this.showMessage('Diária salva com sucesso!', 'success');
    }

    // Método de exclusão movido para executeDelete() com modal customizado

    renderDiarias() {
        const tbody = document.querySelector('#diarias-table tbody');
        tbody.innerHTML = '';

        this.data.diarias.forEach(diaria => {
            const motorista = this.data.motoristas.find(m => m.id === diaria.motoristaId);
            const veiculo = this.data.veiculos.find(v => v.id === diaria.veiculoId);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${motorista ? motorista.nome : 'Motorista não encontrado'}</td>
                <td>${veiculo ? `${veiculo.marca} ${veiculo.modelo}` : 'Veículo não encontrado'}</td>
                <td>${this.formatDate(diaria.data)}</td>
                <td>R$ ${diaria.valor.toFixed(2)}</td>
                <td><span class="status-badge status-${diaria.status.toLowerCase()}">${diaria.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-edit" data-action="edit" data-id="${diaria.id}" data-type="diaria">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-delete" data-action="delete" data-id="${diaria.id}" data-type="diaria">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Adicionar event listeners aos botões
        this.attachActionListeners(tbody);
    }

    filterDiarias() {
        const search = document.getElementById('search-diarias').value.toLowerCase();
        const dateFilter = document.getElementById('filter-date-diarias').value;
        const statusFilter = document.getElementById('filter-status-diarias').value;
        
        const filtered = this.data.diarias.filter(diaria => {
            const motorista = this.data.motoristas.find(m => m.id === diaria.motoristaId);
            const matchesSearch = motorista && motorista.nome.toLowerCase().includes(search);
            const matchesDate = !dateFilter || diaria.data === dateFilter;
            const matchesStatus = !statusFilter || diaria.status === statusFilter;
            
            return matchesSearch && matchesDate && matchesStatus;
        });

        this.renderFilteredDiarias(filtered);
    }

    renderFilteredDiarias(diarias) {
        const tbody = document.querySelector('#diarias-table tbody');
        tbody.innerHTML = '';

        diarias.forEach(diaria => {
            const motorista = this.data.motoristas.find(m => m.id === diaria.motoristaId);
            const veiculo = this.data.veiculos.find(v => v.id === diaria.veiculoId);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${motorista ? motorista.nome : 'Motorista não encontrado'}</td>
                <td>${veiculo ? `${veiculo.marca} ${veiculo.modelo}` : 'Veículo não encontrado'}</td>
                <td>${this.formatDate(diaria.data)}</td>
                <td>R$ ${diaria.valor.toFixed(2)}</td>
                <td><span class="status-badge status-${diaria.status.toLowerCase()}">${diaria.status}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-edit" data-action="edit" data-id="${diaria.id}" data-type="diaria">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-delete" data-action="delete" data-id="${diaria.id}" data-type="diaria">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Adicionar event listeners aos botões
        this.attachActionListeners(tbody);
    }

    populateMotoristasSelect() {
        const select = document.getElementById('diaria-motorista');
        select.innerHTML = '<option value="">Selecione um motorista</option>';
        
        this.data.motoristas.filter(m => m.status === 'Ativo').forEach(motorista => {
            const option = document.createElement('option');
            option.value = motorista.id;
            option.textContent = motorista.nome;
            select.appendChild(option);
        });
    }

    populateVeiculosSelect() {
        const select = document.getElementById('diaria-veiculo');
        const motoristaSelect = document.getElementById('diaria-motorista');
        
        // Limpar o select de veículos
        select.innerHTML = '<option value="">Selecione um veículo</option>';
        
        // Se um motorista estiver selecionado, filtrar apenas os veículos dele
        const motoristaId = motoristaSelect.value;
        console.log('🔍 Motorista ID selecionado:', motoristaId);
        console.log('🔍 Total de veículos:', this.data.veiculos.length);
        
        if (motoristaId) {
            const veiculosFiltrados = this.data.veiculos.filter(v => {
                console.log(`🔍 Veículo ${v.marca} ${v.modelo}: motoristaId=${v.motoristaId}, status=${v.status}`);
                return v.status === 'Ativo' && v.motoristaId == motoristaId;
            });
            console.log('🔍 Veículos filtrados:', veiculosFiltrados.length);
            
            veiculosFiltrados.forEach(veiculo => {
                const option = document.createElement('option');
                option.value = veiculo.id;
                option.textContent = `${veiculo.marca} ${veiculo.modelo} - ${veiculo.placa}`;
                select.appendChild(option);
            });
        } else {
            // Se nenhum motorista estiver selecionado, mostrar todos os veículos ativos
            console.log('🔍 Nenhum motorista selecionado, mostrando todos os veículos ativos');
            this.data.veiculos.filter(v => v.status === 'Ativo').forEach(veiculo => {
                const option = document.createElement('option');
                option.value = veiculo.id;
                option.textContent = `${veiculo.marca} ${veiculo.modelo} - ${veiculo.placa}`;
                select.appendChild(option);
            });
        }
    }

    populateVeiculosMotoristaSelect() {
        const select = document.getElementById('veiculo-motorista');
        select.innerHTML = '<option value="">Selecione um motorista</option>';
        
        this.data.motoristas.filter(m => m.status === 'Ativo').forEach(motorista => {
            const option = document.createElement('option');
            option.value = motorista.id;
            option.textContent = motorista.nome;
            select.appendChild(option);
        });
    }

    // Método para calcular o progresso do contrato
    calcularProgressoContrato(contrato) {
        // Buscar todas as diárias pagas do motorista neste contrato
        const diariasPagas = this.data.diarias.filter(d => 
            d.motoristaId === contrato.motoristaId && 
            d.status === 'Pago' &&
            d.data >= contrato.dataInicio &&
            d.data <= contrato.dataVencimento
        );

        // Calcular valor total pago
        const valorPago = diariasPagas.reduce((total, diaria) => total + diaria.valor, 0);
        
        // Calcular valor total do contrato (valor mensal * número de meses)
        const mesesContrato = contrato.duracao / 30; // 30, 60 ou 90 dias = 1, 2 ou 3 meses
        const valorTotalContrato = contrato.valorMensal * mesesContrato;
        
        // Calcular valor restante
        const valorRestante = valorTotalContrato - valorPago;
        
        // Calcular percentual pago
        const percentualPago = (valorPago / valorTotalContrato) * 100;
        
        return {
            valorPago: valorPago,
            valorRestante: Math.max(0, valorRestante),
            percentualPago: Math.min(100, percentualPago),
            diariasPagas: diariasPagas.length,
            totalDiarias: contrato.duracao, // Usar a duração real do contrato
            valorTotalContrato: valorTotalContrato
        };
    }

    // Manutenções CRUD
    openManutencaoModal(id = null) {
        const modal = document.getElementById('manutencao-modal');
        const title = document.getElementById('manutencao-modal-title');
        const form = document.getElementById('manutencao-form');

        if (id) {
            const manutencao = this.data.manutencoes.find(m => m.id === id);
            if (manutencao) {
                title.textContent = 'Editar Manutenção';
                this.currentEditId = id;
                this.currentEditType = 'manutencao';
                
                document.getElementById('manutencao-veiculo').value = manutencao.veiculoId;
                document.getElementById('manutencao-tipo').value = manutencao.tipo;
                document.getElementById('manutencao-data').value = manutencao.data;
                document.getElementById('manutencao-valor').value = manutencao.valor;
                document.getElementById('manutencao-descricao').value = manutencao.descricao;
            }
        } else {
            title.textContent = 'Nova Manutenção';
            this.currentEditId = null;
            this.currentEditType = null;
            form.reset();
            document.getElementById('manutencao-data').value = new Date().toISOString().split('T')[0];
        }

        modal.classList.add('show');
    }

    saveManutencao() {
        const formData = {
            veiculoId: parseInt(document.getElementById('manutencao-veiculo').value),
            tipo: document.getElementById('manutencao-tipo').value.trim(),
            data: document.getElementById('manutencao-data').value,
            valor: parseFloat(document.getElementById('manutencao-valor').value),
            descricao: document.getElementById('manutencao-descricao').value.trim()
        };

        // Validação de campos obrigatórios
        if (!formData.veiculoId) {
            this.showMessage('Veículo é obrigatório!', 'error');
            return;
        }

        if (!formData.tipo) {
            this.showMessage('Tipo é obrigatório!', 'error');
            return;
        }

        if (!formData.data) {
            this.showMessage('Data é obrigatória!', 'error');
            return;
        }

        if (!formData.valor || formData.valor <= 0) {
            this.showMessage('Valor deve ser maior que zero!', 'error');
            return;
        }

        if (this.currentEditId) {
            const index = this.data.manutencoes.findIndex(m => m.id === this.currentEditId);
            if (index !== -1) {
                this.data.manutencoes[index] = { ...formData, id: this.currentEditId };
            }
        } else {
            const newId = Math.max(...this.data.manutencoes.map(m => m.id), 0) + 1;
            this.data.manutencoes.push({ ...formData, id: newId });
        }

        this.saveData();
        this.renderManutencoes();
        this.updateDashboard();
        this.closeFormModal('manutencao-modal');
        this.showMessage('Manutenção salva com sucesso!', 'success');
    }

    // Método de exclusão movido para executeDelete() com modal customizado

    renderManutencoes() {
        const tbody = document.querySelector('#manutencoes-table tbody');
        tbody.innerHTML = '';

        this.data.manutencoes.forEach(manutencao => {
            const veiculo = this.data.veiculos.find(v => v.id === manutencao.veiculoId);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${veiculo ? `${veiculo.marca} ${veiculo.modelo}` : 'Veículo não encontrado'}</td>
                <td>${manutencao.tipo}</td>
                <td>${this.formatDate(manutencao.data)}</td>
                <td>R$ ${manutencao.valor.toFixed(2)}</td>
                <td>${manutencao.descricao}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-edit" data-action="edit" data-id="${manutencao.id}" data-type="manutencao">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-delete" data-action="delete" data-id="${manutencao.id}" data-type="manutencao">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Adicionar event listeners aos botões
        this.attachActionListeners(tbody);
    }

    filterManutencoes() {
        const search = document.getElementById('search-manutencoes').value.toLowerCase();
        const tipoFilter = document.getElementById('filter-tipo-manutencoes').value;
        
        const filtered = this.data.manutencoes.filter(manutencao => {
            const veiculo = this.data.veiculos.find(v => v.id === manutencao.veiculoId);
            const matchesSearch = veiculo && (veiculo.modelo.toLowerCase().includes(search) ||
                            veiculo.marca.toLowerCase().includes(search) ||
                            manutencao.descricao.toLowerCase().includes(search));
            const matchesTipo = !tipoFilter || manutencao.tipo === tipoFilter;
            
            return matchesSearch && matchesTipo;
        });

        this.renderFilteredManutencoes(filtered);
    }

    renderFilteredManutencoes(manutencoes) {
        const tbody = document.querySelector('#manutencoes-table tbody');
        tbody.innerHTML = '';

        manutencoes.forEach(manutencao => {
            const veiculo = this.data.veiculos.find(v => v.id === manutencao.veiculoId);
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${veiculo ? `${veiculo.marca} ${veiculo.modelo}` : 'Veículo não encontrado'}</td>
                <td>${manutencao.tipo}</td>
                <td>${this.formatDate(manutencao.data)}</td>
                <td>R$ ${manutencao.valor.toFixed(2)}</td>
                <td>${manutencao.descricao}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-edit" data-action="edit" data-id="${manutencao.id}" data-type="manutencao">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-delete" data-action="delete" data-id="${manutencao.id}" data-type="manutencao">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Adicionar event listeners aos botões
        this.attachActionListeners(tbody);
    }

    populateVeiculosManutencaoSelect() {
        const select = document.getElementById('manutencao-veiculo');
        select.innerHTML = '<option value="">Selecione um veículo</option>';
        
        this.data.veiculos.forEach(veiculo => {
            const option = document.createElement('option');
            option.value = veiculo.id;
            option.textContent = `${veiculo.marca} ${veiculo.modelo} - ${veiculo.placa}`;
            select.appendChild(option);
        });
    }

    // Contratos CRUD
    openContratoModal(id = null) {
        console.log('🔍 Abrindo modal de contrato, ID:', id);
        const modal = document.getElementById('contrato-modal');
        const title = document.getElementById('contrato-modal-title');
        const form = document.getElementById('contrato-form');

        if (!modal || !title || !form) {
            console.error('❌ Elementos do modal não encontrados');
            return;
        }

        // Sempre popular os selects primeiro
        this.populateContratoSelects();

        if (id) {
            const contrato = this.data.contratos.find(c => c.id === id);
            console.log('📋 Contrato encontrado:', contrato);
            if (contrato) {
                title.textContent = 'Editar Contrato';
                this.currentEditId = id;
                this.currentEditType = 'contrato';
                
                // Aguardar um pouco para garantir que os selects foram populados
                setTimeout(() => {
                    document.getElementById('contrato-veiculo').value = contrato.veiculoId;
                    document.getElementById('contrato-motorista').value = contrato.motoristaId;
                    document.getElementById('contrato-data-inicio').value = contrato.dataInicio;
                    document.getElementById('contrato-duracao').value = contrato.duracao;
                    document.getElementById('contrato-valor-mensal').value = contrato.valorMensal;
                    document.getElementById('contrato-observacoes').value = contrato.observacoes || '';
                    console.log('✅ Dados do contrato carregados no formulário');
                }, 100);
            } else {
                console.error('❌ Contrato não encontrado com ID:', id);
            }
        } else {
            title.textContent = 'Novo Contrato';
            this.currentEditId = null;
            this.currentEditType = null;
            form.reset();
            document.getElementById('contrato-data-inicio').value = new Date().toISOString().split('T')[0];
        }

        modal.classList.add('show');
        console.log('✅ Modal de contrato aberto');
        
        // Configurar botões de atalho para duração
        this.setupDurationShortcuts();
    }

    saveContrato() {
        const valorMensal = parseFloat(document.getElementById('contrato-valor-mensal').value);
        const duracao = parseInt(document.getElementById('contrato-duracao').value);
        const dataInicio = new Date(document.getElementById('contrato-data-inicio').value);
        const dataVencimento = new Date(dataInicio);
        dataVencimento.setDate(dataVencimento.getDate() + duracao);

        const formData = {
            veiculoId: parseInt(document.getElementById('contrato-veiculo').value),
            motoristaId: parseInt(document.getElementById('contrato-motorista').value),
            dataInicio: document.getElementById('contrato-data-inicio').value,
            dataVencimento: dataVencimento.toISOString().split('T')[0],
            duracao: duracao,
            valorMensal: valorMensal,
            valorSemanal: valorMensal / 4,
            valorDiario: valorMensal / 30,
            status: 'Ativo',
            observacoes: document.getElementById('contrato-observacoes').value
        };

        // Validação de campos obrigatórios
        if (!formData.veiculoId) {
            this.showMessage('Veículo é obrigatório!', 'error');
            return;
        }

        if (!formData.motoristaId) {
            this.showMessage('Motorista é obrigatório!', 'error');
            return;
        }

        if (!formData.dataInicio) {
            this.showMessage('Data de início é obrigatória!', 'error');
            return;
        }

        if (!formData.valorMensal || formData.valorMensal <= 0) {
            this.showMessage('Valor mensal deve ser maior que zero!', 'error');
            return;
        }

        if (!formData.duracao || formData.duracao < 1 || formData.duracao > 365) {
            this.showMessage('Duração do contrato deve ser entre 1 e 365 dias!', 'error');
            return;
        }

        if (this.currentEditId) {
            const index = this.data.contratos.findIndex(c => c.id === this.currentEditId);
            if (index !== -1) {
                this.data.contratos[index] = { ...formData, id: this.currentEditId };
            }
        } else {
            const newId = Math.max(...this.data.contratos.map(c => c.id), 0) + 1;
            this.data.contratos.push({ ...formData, id: newId });
        }

        this.saveData();
        this.renderContratos();
        this.updateDashboard();
        this.closeFormModal('contrato-modal');
        this.showMessage('Contrato salvo com sucesso!', 'success');
    }

    // Método de exclusão movido para executeDelete() com modal customizado

    renderContratos() {
        const tbody = document.querySelector('#contratos-table tbody');
        tbody.innerHTML = '';

        this.data.contratos.forEach(contrato => {
            const veiculo = this.data.veiculos.find(v => v.id === contrato.veiculoId);
            const motorista = this.data.motoristas.find(m => m.id === contrato.motoristaId);
            const hoje = new Date();
            const vencimento = new Date(contrato.dataVencimento);
            const diasParaVencimento = Math.ceil((vencimento - hoje) / (1000 * 60 * 60 * 24));
            
            let farolClass = 'farol-cinza';
            let status = contrato.status;
            
            if (status === 'Ativo') {
                if (diasParaVencimento <= 0) {
                    farolClass = 'farol-vermelho';
                    status = 'Vencido';
                } else if (diasParaVencimento <= 10) {
                    farolClass = 'farol-amarelo';
                } else {
                    farolClass = 'farol-verde';
                }
            }

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${veiculo ? `${veiculo.marca} ${veiculo.modelo}` : 'Veículo não encontrado'}</td>
                <td>${motorista ? motorista.nome : 'Motorista não encontrado'}</td>
                <td>${this.formatDate(contrato.dataInicio)}</td>
                <td>${this.formatDate(contrato.dataVencimento)}</td>
                <td>${contrato.duracao} dias</td>
                <td>R$ ${contrato.valorMensal.toFixed(2)}</td>
                <td><span class="status-badge status-${status.toLowerCase()}">${status}</span></td>
                <td><span class="farol ${farolClass}"></span>${diasParaVencimento > 0 ? `${diasParaVencimento} dias` : 'Vencido'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-edit" data-action="edit" data-id="${contrato.id}" data-type="contrato">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-delete" data-action="delete" data-id="${contrato.id}" data-type="contrato">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Adicionar event listeners aos botões
        this.attachActionListeners(tbody);
    }

    filterContratos() {
        const search = document.getElementById('search-contratos').value.toLowerCase();
        const statusFilter = document.getElementById('filter-status-contratos').value;
        const vencimentoFilter = document.getElementById('filter-vencimento-contratos').value;
        
        const filtered = this.data.contratos.filter(contrato => {
            const veiculo = this.data.veiculos.find(v => v.id === contrato.veiculoId);
            const motorista = this.data.motoristas.find(m => m.id === contrato.motoristaId);
            
            const matchesSearch = (veiculo && (veiculo.modelo.toLowerCase().includes(search) || veiculo.marca.toLowerCase().includes(search))) ||
                                (motorista && motorista.nome.toLowerCase().includes(search));
            
            const hoje = new Date();
            const vencimento = new Date(contrato.dataVencimento);
            const diasParaVencimento = Math.ceil((vencimento - hoje) / (1000 * 60 * 60 * 24));
            
            let status = contrato.status;
            if (status === 'Ativo' && diasParaVencimento <= 0) {
                status = 'Vencido';
            }
            
            const matchesStatus = !statusFilter || status === statusFilter;
            
            let matchesVencimento = true;
            if (vencimentoFilter === 'vencendo') {
                matchesVencimento = status === 'Ativo' && diasParaVencimento <= 10 && diasParaVencimento > 0;
            } else if (vencimentoFilter === 'vencido') {
                matchesVencimento = diasParaVencimento <= 0;
            }
            
            return matchesSearch && matchesStatus && matchesVencimento;
        });

        this.renderFilteredContratos(filtered);
    }

    renderFilteredContratos(contratos) {
        const tbody = document.querySelector('#contratos-table tbody');
        tbody.innerHTML = '';

        contratos.forEach(contrato => {
            const veiculo = this.data.veiculos.find(v => v.id === contrato.veiculoId);
            const motorista = this.data.motoristas.find(m => m.id === contrato.motoristaId);
            const hoje = new Date();
            const vencimento = new Date(contrato.dataVencimento);
            const diasParaVencimento = Math.ceil((vencimento - hoje) / (1000 * 60 * 60 * 24));
            
            let farolClass = 'farol-cinza';
            let status = contrato.status;
            
            if (status === 'Ativo') {
                if (diasParaVencimento <= 0) {
                    farolClass = 'farol-vermelho';
                    status = 'Vencido';
                } else if (diasParaVencimento <= 10) {
                    farolClass = 'farol-amarelo';
                } else {
                    farolClass = 'farol-verde';
                }
            }

            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${veiculo ? `${veiculo.marca} ${veiculo.modelo}` : 'Veículo não encontrado'}</td>
                <td>${motorista ? motorista.nome : 'Motorista não encontrado'}</td>
                <td>${this.formatDate(contrato.dataInicio)}</td>
                <td>${this.formatDate(contrato.dataVencimento)}</td>
                <td>${contrato.duracao} dias</td>
                <td>R$ ${contrato.valorMensal.toFixed(2)}</td>
                <td><span class="status-badge status-${status.toLowerCase()}">${status}</span></td>
                <td><span class="farol ${farolClass}"></span>${diasParaVencimento > 0 ? `${diasParaVencimento} dias` : 'Vencido'}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-edit" data-action="edit" data-id="${contrato.id}" data-type="contrato">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-delete" data-action="delete" data-id="${contrato.id}" data-type="contrato">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Adicionar event listeners aos botões
        this.attachActionListeners(tbody);
    }

    populateContratoSelects() {
        console.log('🔄 Populando selects do modal de contrato');
        
        // Populate veículos
        const veiculoSelect = document.getElementById('contrato-veiculo');
        if (!veiculoSelect) {
            console.error('❌ Select de veículo não encontrado');
            return;
        }
        
        veiculoSelect.innerHTML = '<option value="">Selecione um veículo</option>';
        const veiculosAtivos = this.data.veiculos.filter(v => v.status === 'Ativo');
        console.log('🚗 Veículos ativos:', veiculosAtivos.length);
        
        veiculosAtivos.forEach(veiculo => {
            const option = document.createElement('option');
            option.value = veiculo.id;
            option.textContent = `${veiculo.marca} ${veiculo.modelo} - ${veiculo.placa}`;
            veiculoSelect.appendChild(option);
        });

        // Populate motoristas
        const motoristaSelect = document.getElementById('contrato-motorista');
        if (!motoristaSelect) {
            console.error('❌ Select de motorista não encontrado');
            return;
        }
        
        motoristaSelect.innerHTML = '<option value="">Selecione um motorista</option>';
        const motoristasAtivos = this.data.motoristas.filter(m => m.status === 'Ativo');
        console.log('👤 Motoristas ativos:', motoristasAtivos.length);
        
        motoristasAtivos.forEach(motorista => {
            const option = document.createElement('option');
            option.value = motorista.id;
            option.textContent = motorista.nome;
            motoristaSelect.appendChild(option);
        });
        
        console.log('✅ Selects do modal de contrato populados');
    }

    setupDurationShortcuts() {
        const shortcuts = document.querySelectorAll('.btn-duration-shortcut');
        const duracaoInput = document.getElementById('contrato-duracao');
        
        shortcuts.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const days = parseInt(button.dataset.days);
                duracaoInput.value = days;
                duracaoInput.focus();
                
                // Feedback visual
                button.style.background = 'rgba(30, 58, 138, 0.3)';
                setTimeout(() => {
                    button.style.background = '';
                }, 200);
            });
        });
    }

    // Função para detectar o período com dados
    detectarPeriodoComDados() {
        console.log('🔍 Detectando período com dados...');
        const todasAsDatas = [];
        
        // Coletar todas as datas de diárias
        this.data.diarias.forEach(diaria => {
            if (diaria.data) {
                const data = new Date(diaria.data);
                if (!isNaN(data.getTime())) {
                    todasAsDatas.push(data);
                }
            }
        });
        
        // Coletar todas as datas de manutenções
        this.data.manutencoes.forEach(manutencao => {
            if (manutencao.data) {
                const data = new Date(manutencao.data);
                if (!isNaN(data.getTime())) {
                    todasAsDatas.push(data);
                }
            }
        });
        
        // Coletar todas as datas de contratos
        this.data.contratos.forEach(contrato => {
            if (contrato.dataInicio) {
                const data = new Date(contrato.dataInicio);
                if (!isNaN(data.getTime())) {
                    todasAsDatas.push(data);
                }
            }
            if (contrato.dataVencimento) {
                const data = new Date(contrato.dataVencimento);
                if (!isNaN(data.getTime())) {
                    todasAsDatas.push(data);
                }
            }
        });
        
        // Coletar todas as datas do financeiro
        this.data.financeiro.forEach(financeiro => {
            if (financeiro.data) {
                const data = new Date(financeiro.data);
                if (!isNaN(data.getTime())) {
                    todasAsDatas.push(data);
                }
            }
        });
        
        console.log(`📊 Total de datas encontradas: ${todasAsDatas.length}`);
        
        if (todasAsDatas.length === 0) {
            console.log('📅 Nenhum dado encontrado, usando período padrão');
            // Se não há dados, usar período padrão (última semana)
            const hoje = new Date();
            const umaSemanaAtras = new Date(hoje);
            umaSemanaAtras.setDate(hoje.getDate() - 7);
            return {
                dataInicio: umaSemanaAtras.toISOString().split('T')[0],
                dataFim: hoje.toISOString().split('T')[0]
            };
        }
        
        // Encontrar a data mais antiga e mais recente
        const dataMaisAntiga = new Date(Math.min(...todasAsDatas));
        const dataMaisRecente = new Date(Math.max(...todasAsDatas));
        
        console.log(`📅 Período detectado: ${dataMaisAntiga.toISOString().split('T')[0]} até ${dataMaisRecente.toISOString().split('T')[0]}`);
        
        return {
            dataInicio: dataMaisAntiga.toISOString().split('T')[0],
            dataFim: dataMaisRecente.toISOString().split('T')[0]
        };
    }

    // Relatórios
    setupRelatorios() {
        // Detectar período com dados automaticamente
        const periodo = this.detectarPeriodoComDados();
        
        document.getElementById('relatorio-data-inicio').value = periodo.dataInicio;
        document.getElementById('relatorio-data-fim').value = periodo.dataFim;
        
        // Gerar relatórios automaticamente
        this.gerarRelatorios();
        
        // Adicionar event listeners para regenerar relatórios quando datas mudarem
        document.getElementById('relatorio-data-inicio').addEventListener('change', () => {
            this.gerarRelatorios();
        });
        
        document.getElementById('relatorio-data-fim').addEventListener('change', () => {
            this.gerarRelatorios();
        });
        
        document.getElementById('relatorio-tipo').addEventListener('change', () => {
            this.gerarRelatorios();
        });

        // Configurar relatório semanal por motorista (aguardar um pouco para garantir que os dados foram carregados)
        setTimeout(() => {
            this.setupRelatorioSemanal();
        }, 100);
    }

    setupRelatorioSemanal() {
        console.log('🔧 Configurando relatório semanal...');
        console.log('📊 Motoristas disponíveis:', this.data.motoristas.length);
        console.log('📋 Contratos disponíveis:', this.data.contratos.length);
        
        // Popular select de motoristas
        const selectMotorista = document.getElementById('relatorio-motorista-semanal');
        selectMotorista.innerHTML = '<option value="">Selecione um motorista</option>';
        
        if (this.data.motoristas.length === 0) {
            console.log('⚠️ Nenhum motorista encontrado');
            const option = document.createElement('option');
            option.value = '';
            option.textContent = 'Nenhum motorista cadastrado';
            option.disabled = true;
            selectMotorista.appendChild(option);
            
            // Forçar criação de dados de exemplo
            console.log('🔧 Forçando criação de dados de exemplo...');
            this.criarDadosExemploForcado();
            return;
        }
        
        this.data.motoristas.forEach(motorista => {
            console.log(`👤 Adicionando motorista: ${motorista.nome} (ID: ${motorista.id})`);
            const option = document.createElement('option');
            option.value = motorista.id;
            option.textContent = motorista.nome;
            selectMotorista.appendChild(option);
        });

        // Event listeners
        selectMotorista.addEventListener('change', () => {
            this.atualizarRelatorioSemanal();
        });

        document.getElementById('relatorio-semana-semanal').addEventListener('change', () => {
            this.atualizarRelatorioSemanal();
        });
    }

    atualizarRelatorioSemanal() {
        const motoristaId = document.getElementById('relatorio-motorista-semanal').value;
        const semanaFiltro = document.getElementById('relatorio-semana-semanal').value;
        
        console.log('🔄 Atualizando relatório semanal...');
        console.log('👤 Motorista ID selecionado:', motoristaId);
        console.log('📅 Filtro de semana:', semanaFiltro);
        
        if (!motoristaId) {
            console.log('⚠️ Nenhum motorista selecionado');
            document.getElementById('relatorio-semanal-motorista').innerHTML = 
                '<div class="empty-detail">Selecione um motorista para ver o resumo semanal</div>';
            return;
        }

        const dataInicio = document.getElementById('relatorio-data-inicio').value;
        const dataFim = document.getElementById('relatorio-data-fim').value;
        
        console.log('📅 Período selecionado:', dataInicio, 'até', dataFim);
        
        const relatorio = this.gerarRelatorioSemanalMotorista(motoristaId, dataInicio, dataFim);
        
        if (!relatorio) {
            console.log('❌ Relatório não gerado - motorista não encontrado ou sem contratos');
            document.getElementById('relatorio-semanal-motorista').innerHTML = 
                '<div class="empty-detail">Motorista não encontrado ou sem contratos cadastrados</div>';
            return;
        }
        
        console.log('✅ Relatório gerado com sucesso:', relatorio);

        // Filtrar semanas se necessário
        let semanasParaExibir = relatorio.semanas;
        if (semanaFiltro) {
            const numeroSemana = parseInt(semanaFiltro);
            semanasParaExibir = relatorio.semanas.filter(s => s.numero === numeroSemana);
        }

        this.renderRelatorioSemanal(relatorio, semanasParaExibir);
    }

    renderRelatorioSemanal(relatorio, semanas) {
        const container = document.getElementById('relatorio-semanal-motorista');
        
        if (semanas.length === 0) {
            container.innerHTML = '<div class="empty-detail">Nenhuma semana encontrada no período selecionado</div>';
            return;
        }

        // Atualizar select de semanas
        const selectSemana = document.getElementById('relatorio-semana-semanal');
        selectSemana.innerHTML = '<option value="">Todas as semanas</option>';
        relatorio.semanas.forEach(semana => {
            const option = document.createElement('option');
            option.value = semana.numero;
            option.textContent = `Semana ${semana.numero} - ${semana.periodo}`;
            selectSemana.appendChild(option);
        });

        const html = `
            <div class="relatorio-motorista-header">
                <h4>${relatorio.motorista.nome}</h4>
                <div class="relatorio-motorista-stats">
                    <div class="relatorio-stat">
                        <div class="relatorio-stat-value">${relatorio.totalSemanas}</div>
                        <div class="relatorio-stat-label">Semanas</div>
                    </div>
                    <div class="relatorio-stat">
                        <div class="relatorio-stat-value">${relatorio.totalDiarias}</div>
                        <div class="relatorio-stat-label">Total Diárias</div>
                    </div>
                    <div class="relatorio-stat">
                        <div class="relatorio-stat-value">R$ ${relatorio.totalValor.toFixed(2)}</div>
                        <div class="relatorio-stat-label">Valor Total</div>
                    </div>
                    <div class="relatorio-stat">
                        <div class="relatorio-stat-value">R$ ${relatorio.totalPago.toFixed(2)}</div>
                        <div class="relatorio-stat-label">Valor Pago</div>
                    </div>
                </div>
            </div>
            <div class="semanas-container">
                ${semanas.map(semana => `
                    <div class="semana-card">
                        <div class="semana-header">
                            <div class="semana-numero">Semana ${semana.numero}</div>
                            <div class="semana-periodo">${semana.periodo}</div>
                        </div>
                        <div class="semana-stats">
                            <div class="semana-stat total">
                                <div class="semana-stat-value">${semana.totalDiarias}</div>
                                <div class="semana-stat-label">Diárias</div>
                            </div>
                            <div class="semana-stat pago">
                                <div class="semana-stat-value">${semana.diariasPagas}</div>
                                <div class="semana-stat-label">Pagas</div>
                            </div>
                            <div class="semana-stat pendente">
                                <div class="semana-stat-value">${semana.diariasPendentes}</div>
                                <div class="semana-stat-label">Pendentes</div>
                            </div>
                            <div class="semana-stat total">
                                <div class="semana-stat-value">R$ ${semana.valorTotal.toFixed(2)}</div>
                                <div class="semana-stat-label">Valor Total</div>
                            </div>
                            <div class="semana-stat pago">
                                <div class="semana-stat-value">R$ ${semana.valorPago.toFixed(2)}</div>
                                <div class="semana-stat-label">Valor Pago</div>
                            </div>
                            <div class="semana-stat pendente">
                                <div class="semana-stat-value">R$ ${semana.valorPendente.toFixed(2)}</div>
                                <div class="semana-stat-label">Valor Pendente</div>
                            </div>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;

        container.innerHTML = html;
    }

    verificarECriarDadosExemplo() {
        console.log('🔍 Verificando se há dados de exemplo...');
        console.log('📊 Estado atual dos dados:');
        console.log('- Motoristas:', this.data.motoristas.length);
        console.log('- Contratos:', this.data.contratos.length);
        console.log('- Veículos:', this.data.veiculos.length);
        console.log('- Diárias:', this.data.diarias.length);
        
        // Verificar se já existem dados
        if (this.data.motoristas.length > 0 && this.data.contratos.length > 0) {
            console.log('✅ Dados já existem, não criando exemplos');
            return;
        }
        
        console.log('⚠️ Dados insuficientes, criando exemplos...');
        
        console.log('📝 Criando dados de exemplo para demonstração...');
        
        // Criar motorista de exemplo
        const motoristaExemplo = {
            id: 1,
            nome: 'João Silva',
            cpf: '123.456.789-00',
            telefone: '(11) 99999-9999',
            endereco: 'Rua das Flores, 123',
            dataCadastro: new Date().toISOString().split('T')[0]
        };
        
        // Criar veículo de exemplo
        const veiculoExemplo = {
            id: 1,
            marca: 'Chevrolet',
            modelo: 'Agile',
            placa: 'ABC-1234',
            ano: 2020,
            cor: 'Branco',
            status: 'Ativo',
            dataCadastro: new Date().toISOString().split('T')[0]
        };
        
        // Criar contrato de exemplo
        const contratoExemplo = {
            id: 1,
            motoristaId: 1,
            veiculoId: 1,
            dataInicio: '2024-10-14',
            dataVencimento: '2025-10-14',
            duracao: 365,
            valorMensal: 2000,
            valorSemanal: 500,
            valorDiario: 100,
            status: 'Ativo',
            observacoes: 'Contrato de exemplo'
        };
        
        // Criar diárias de exemplo
        const diariasExemplo = [
            {
                id: 1,
                motoristaId: 1,
                veiculoId: 1,
                data: '2024-10-15',
                valor: 100,
                status: 'Pago'
            },
            {
                id: 2,
                motoristaId: 1,
                veiculoId: 1,
                data: '2024-10-16',
                valor: 100,
                status: 'Pago'
            },
            {
                id: 3,
                motoristaId: 1,
                veiculoId: 1,
                data: '2024-10-17',
                valor: 100,
                status: 'Pendente'
            }
        ];
        
        // Adicionar aos dados
        this.data.motoristas.push(motoristaExemplo);
        this.data.veiculos.push(veiculoExemplo);
        this.data.contratos.push(contratoExemplo);
        this.data.diarias.push(...diariasExemplo);
        
        // Salvar dados
        this.saveData();
        
        console.log('✅ Dados de exemplo criados com sucesso');
        
        // Recarregar o setup do relatório semanal
        setTimeout(() => {
            this.setupRelatorioSemanal();
        }, 100);
    }

    // Função para forçar criação de dados de exemplo
    criarDadosExemploForcado() {
        console.log('🔧 Forçando criação de dados de exemplo...');
        
        // Limpar dados existentes se necessário
        this.data.motoristas = [];
        this.data.veiculos = [];
        this.data.contratos = [];
        this.data.diarias = [];
        
        // Criar motorista de exemplo
        const motoristaExemplo = {
            id: 1,
            nome: 'João Silva',
            cpf: '123.456.789-00',
            telefone: '(11) 99999-9999',
            endereco: 'Rua das Flores, 123',
            dataCadastro: new Date().toISOString().split('T')[0]
        };
        
        // Criar veículo de exemplo
        const veiculoExemplo = {
            id: 1,
            marca: 'Chevrolet',
            modelo: 'Agile',
            placa: 'ABC-1234',
            ano: 2020,
            cor: 'Branco',
            status: 'Ativo',
            dataCadastro: new Date().toISOString().split('T')[0]
        };
        
        // Criar contrato de exemplo
        const contratoExemplo = {
            id: 1,
            motoristaId: 1,
            veiculoId: 1,
            dataInicio: '2024-10-14',
            dataVencimento: '2025-10-14',
            duracao: 365,
            valorMensal: 2000,
            valorSemanal: 500,
            valorDiario: 100,
            status: 'Ativo',
            observacoes: 'Contrato de exemplo'
        };
        
        // Criar diárias de exemplo
        const diariasExemplo = [
            {
                id: 1,
                motoristaId: 1,
                veiculoId: 1,
                data: '2024-10-15',
                valor: 100,
                status: 'Pago'
            },
            {
                id: 2,
                motoristaId: 1,
                veiculoId: 1,
                data: '2024-10-16',
                valor: 100,
                status: 'Pago'
            },
            {
                id: 3,
                motoristaId: 1,
                veiculoId: 1,
                data: '2024-10-17',
                valor: 100,
                status: 'Pendente'
            }
        ];
        
        // Adicionar aos dados
        this.data.motoristas.push(motoristaExemplo);
        this.data.veiculos.push(veiculoExemplo);
        this.data.contratos.push(contratoExemplo);
        this.data.diarias.push(...diariasExemplo);
        
        // Salvar dados
        this.saveData();
        
        console.log('✅ Dados de exemplo criados com sucesso');
        console.log('📊 Dados após criação:');
        console.log('- Motoristas:', this.data.motoristas.length);
        console.log('- Contratos:', this.data.contratos.length);
        console.log('- Veículos:', this.data.veiculos.length);
        console.log('- Diárias:', this.data.diarias.length);
        
        // Recarregar o setup do relatório semanal
        setTimeout(() => {
            this.setupRelatorioSemanal();
        }, 100);
    }

    definirPeriodoCompleto() {
        const periodo = this.detectarPeriodoComDados();
        document.getElementById('relatorio-data-inicio').value = periodo.dataInicio;
        document.getElementById('relatorio-data-fim').value = periodo.dataFim;
        this.gerarRelatorios();
        this.showMessage('Período definido para todo o histórico de dados', 'success');
    }

    // Função para calcular as semanas de um motorista baseado na data de início do contrato
    calcularSemanasMotorista(motoristaId) {
        console.log('📅 Calculando semanas para motorista ID:', motoristaId);
        
        // Encontrar o contrato mais antigo do motorista
        const contratosMotorista = this.data.contratos.filter(c => c.motoristaId === motoristaId);
        console.log('📋 Contratos encontrados para o motorista:', contratosMotorista.length);
        
        if (contratosMotorista.length === 0) {
            console.log('⚠️ Nenhum contrato encontrado para o motorista');
            return [];
        }

        // Ordenar por data de início e pegar o mais antigo
        const contratoInicial = contratosMotorista.sort((a, b) => new Date(a.dataInicio) - new Date(b.dataInicio))[0];
        const dataInicioContrato = new Date(contratoInicial.dataInicio);
        
        console.log(`📅 Data de início do contrato para motorista ${motoristaId}: ${dataInicioContrato.toISOString().split('T')[0]}`);

        // Calcular todas as semanas desde o início do contrato até hoje
        const semanas = [];
        const hoje = new Date();
        let dataAtual = new Date(dataInicioContrato);
        let numeroSemana = 1;

        while (dataAtual <= hoje) {
            const inicioSemana = new Date(dataAtual);
            const fimSemana = new Date(dataAtual);
            fimSemana.setDate(fimSemana.getDate() + 6); // 6 dias depois = fim da semana

            semanas.push({
                numero: numeroSemana,
                inicio: inicioSemana.toISOString().split('T')[0],
                fim: fimSemana.toISOString().split('T')[0],
                periodo: `${this.formatDate(inicioSemana.toISOString().split('T')[0])} - ${this.formatDate(fimSemana.toISOString().split('T')[0])}`
            });

            // Avançar para a próxima semana
            dataAtual.setDate(dataAtual.getDate() + 7);
            numeroSemana++;
        }

        console.log(`📊 Total de semanas calculadas: ${semanas.length}`);
        return semanas;
    }

    // Função para gerar relatório semanal por motorista
    gerarRelatorioSemanalMotorista(motoristaId, semanaInicio, semanaFim) {
        console.log('🔍 Gerando relatório semanal para motorista ID:', motoristaId);
        
        const motorista = this.data.motoristas.find(m => m.id === motoristaId);
        if (!motorista) {
            console.log('❌ Motorista não encontrado com ID:', motoristaId);
            console.log('📊 Motoristas disponíveis:', this.data.motoristas.map(m => ({ id: m.id, nome: m.nome })));
            return null;
        }
        
        console.log('✅ Motorista encontrado:', motorista.nome);

        const semanas = this.calcularSemanasMotorista(motoristaId);
        const semanasFiltradas = semanas.filter(semana => {
            const dataInicio = new Date(semanaInicio);
            const dataFim = new Date(semanaFim);
            const inicioSemana = new Date(semana.inicio);
            const fimSemana = new Date(semana.fim);
            
            return (inicioSemana >= dataInicio && inicioSemana <= dataFim) ||
                   (fimSemana >= dataInicio && fimSemana <= dataFim) ||
                   (inicioSemana <= dataInicio && fimSemana >= dataFim);
        });

        const relatorioSemanas = semanasFiltradas.map(semana => {
            // Filtrar diárias da semana
            const diariasSemana = this.data.diarias.filter(diaria => {
                if (diaria.motoristaId !== motoristaId) return false;
                const dataDiaria = new Date(diaria.data);
                const inicioSemana = new Date(semana.inicio);
                const fimSemana = new Date(semana.fim);
                return dataDiaria >= inicioSemana && dataDiaria <= fimSemana;
            });

            // Calcular totais da semana
            const totalDiarias = diariasSemana.length;
            const valorTotal = diariasSemana.reduce((sum, d) => sum + d.valor, 0);
            const valorPago = diariasSemana.filter(d => d.status === 'Pago').reduce((sum, d) => sum + d.valor, 0);
            const diariasPagas = diariasSemana.filter(d => d.status === 'Pago').length;

            return {
                ...semana,
                totalDiarias,
                valorTotal,
                valorPago,
                diariasPagas,
                diariasPendentes: totalDiarias - diariasPagas,
                valorPendente: valorTotal - valorPago
            };
        });

        return {
            motorista,
            semanas: relatorioSemanas,
            totalSemanas: relatorioSemanas.length,
            totalDiarias: relatorioSemanas.reduce((sum, s) => sum + s.totalDiarias, 0),
            totalValor: relatorioSemanas.reduce((sum, s) => sum + s.valorTotal, 0),
            totalPago: relatorioSemanas.reduce((sum, s) => sum + s.valorPago, 0)
        };
    }

    gerarRelatorios() {
        const dataInicio = document.getElementById('relatorio-data-inicio').value;
        const dataFim = document.getElementById('relatorio-data-fim').value;
        const tipo = document.getElementById('relatorio-tipo').value;

        if (!dataInicio || !dataFim) {
            this.showMessage('Por favor, selecione as datas de início e fim', 'error');
            return;
        }

        if (new Date(dataInicio) > new Date(dataFim)) {
            this.showMessage('A data de início deve ser anterior à data de fim', 'error');
            return;
        }

        this.gerarRelatorioVeiculos(dataInicio, dataFim);
        this.gerarRelatorioMotoristas(dataInicio, dataFim);
        this.gerarRelatorioManutencoes(dataInicio, dataFim);
    }

    gerarRelatorioVeiculos(dataInicio, dataFim) {
        const container = document.getElementById('relatorio-veiculos');
        
        // Filtrar diárias no período
        const diariasPeriodo = this.data.diarias.filter(d => {
            const dataDiaria = new Date(d.data);
            return dataDiaria >= new Date(dataInicio) && dataDiaria <= new Date(dataFim);
        });

        // Filtrar manutenções no período
        const manutencoesPeriodo = this.data.manutencoes.filter(m => {
            const dataManutencao = new Date(m.data);
            return dataManutencao >= new Date(dataInicio) && dataManutencao <= new Date(dataFim);
        });

        // Agrupar por veículo
        const relatorioVeiculos = {};
        
        // Processar diárias
        diariasPeriodo.forEach(diaria => {
            const veiculo = this.data.veiculos.find(v => v.id === diaria.veiculoId);
            if (veiculo) {
                const veiculoKey = `${veiculo.marca} ${veiculo.modelo}`;
                if (!relatorioVeiculos[veiculoKey]) {
                    relatorioVeiculos[veiculoKey] = {
                        veiculo,
                        totalDiarias: 0,
                        totalValor: 0,
                        diariasPagas: 0,
                        valorPago: 0,
                        totalManutencoes: 0,
                        valorManutencoes: 0,
                        saldo: 0
                    };
                }
                relatorioVeiculos[veiculoKey].totalDiarias++;
                relatorioVeiculos[veiculoKey].totalValor += diaria.valor;
                if (diaria.status === 'Pago') {
                    relatorioVeiculos[veiculoKey].diariasPagas++;
                    relatorioVeiculos[veiculoKey].valorPago += diaria.valor;
                }
            }
        });

        // Processar manutenções
        manutencoesPeriodo.forEach(manutencao => {
            const veiculo = this.data.veiculos.find(v => v.id === manutencao.veiculoId);
            if (veiculo) {
                const veiculoKey = `${veiculo.marca} ${veiculo.modelo}`;
                if (!relatorioVeiculos[veiculoKey]) {
                    relatorioVeiculos[veiculoKey] = {
                        veiculo,
                        totalDiarias: 0,
                        totalValor: 0,
                        diariasPagas: 0,
                        valorPago: 0,
                        totalManutencoes: 0,
                        valorManutencoes: 0,
                        saldo: 0
                    };
                }
                relatorioVeiculos[veiculoKey].totalManutencoes++;
                relatorioVeiculos[veiculoKey].valorManutencoes += manutencao.valor;
            }
        });

        // Calcular saldo para cada veículo
        Object.values(relatorioVeiculos).forEach(item => {
            item.saldo = item.valorPago - item.valorManutencoes;
        });

        // Renderizar relatório
        const relatorioItems = Object.values(relatorioVeiculos)
            .sort((a, b) => b.totalValor - a.totalValor);

        if (relatorioItems.length === 0) {
            container.innerHTML = '<div class="empty-detail">Nenhuma diária encontrada no período selecionado</div>';
            return;
        }

        const totalGeral = relatorioItems.reduce((sum, item) => sum + item.totalValor, 0);
        const totalPago = relatorioItems.reduce((sum, item) => sum + item.valorPago, 0);

        container.innerHTML = relatorioItems.map(item => `
            <div class="relatorio-item">
                <div class="relatorio-item-info">
                    <div class="relatorio-item-title">${item.veiculo.marca} ${item.veiculo.modelo}</div>
                    <div class="relatorio-item-subtitle">${item.veiculo.placa}</div>
                </div>
                <div class="relatorio-item-stats">
                    <div class="relatorio-stat">
                        <div class="relatorio-stat-value">${item.totalDiarias}</div>
                        <div class="relatorio-stat-label">Diárias</div>
                    </div>
                    <div class="relatorio-stat">
                        <div class="relatorio-stat-value">R$ ${item.valorPago.toFixed(2)}</div>
                        <div class="relatorio-stat-label">Receita</div>
                    </div>
                    <div class="relatorio-stat">
                        <div class="relatorio-stat-value">R$ ${item.valorManutencoes.toFixed(2)}</div>
                        <div class="relatorio-stat-label">Manutenções</div>
                    </div>
                    <div class="relatorio-stat ${item.saldo >= 0 ? 'saldo-positivo' : 'saldo-negativo'}">
                        <div class="relatorio-stat-value">R$ ${item.saldo.toFixed(2)}</div>
                        <div class="relatorio-stat-label">Saldo</div>
                    </div>
                </div>
            </div>
        `).join('') + `
            <div class="relatorio-total">
                <div class="relatorio-total-value">R$ ${totalGeral.toFixed(2)}</div>
                <div class="relatorio-total-label">Total Geral (R$ ${totalPago.toFixed(2)} pago)</div>
            </div>
        `;
    }

    gerarRelatorioMotoristas(dataInicio, dataFim) {
        const container = document.getElementById('relatorio-motoristas');
        
        // Filtrar diárias no período
        const diariasPeriodo = this.data.diarias.filter(d => {
            const dataDiaria = new Date(d.data);
            return dataDiaria >= new Date(dataInicio) && dataDiaria <= new Date(dataFim);
        });

        // Agrupar por motorista
        const relatorioMotoristas = {};
        diariasPeriodo.forEach(diaria => {
            const motorista = this.data.motoristas.find(m => m.id === diaria.motoristaId);
            if (motorista) {
                if (!relatorioMotoristas[motorista.nome]) {
                    relatorioMotoristas[motorista.nome] = {
                        motorista,
                        totalDiarias: 0,
                        totalValor: 0,
                        diariasPagas: 0,
                        valorPago: 0
                    };
                }
                relatorioMotoristas[motorista.nome].totalDiarias++;
                relatorioMotoristas[motorista.nome].totalValor += diaria.valor;
                if (diaria.status === 'Pago') {
                    relatorioMotoristas[motorista.nome].diariasPagas++;
                    relatorioMotoristas[motorista.nome].valorPago += diaria.valor;
                }
            }
        });

        // Renderizar relatório
        const relatorioItems = Object.values(relatorioMotoristas)
            .sort((a, b) => b.totalValor - a.totalValor);

        if (relatorioItems.length === 0) {
            container.innerHTML = '<div class="empty-detail">Nenhuma diária encontrada no período selecionado</div>';
            return;
        }

        const totalGeral = relatorioItems.reduce((sum, item) => sum + item.totalValor, 0);
        const totalPago = relatorioItems.reduce((sum, item) => sum + item.valorPago, 0);

        container.innerHTML = relatorioItems.map(item => `
            <div class="relatorio-item">
                <div class="relatorio-item-info">
                    <div class="relatorio-item-title">${item.motorista.nome}</div>
                    <div class="relatorio-item-subtitle">${item.motorista.cpf}</div>
                </div>
                <div class="relatorio-item-stats">
                    <div class="relatorio-stat">
                        <div class="relatorio-stat-value">${item.totalDiarias}</div>
                        <div class="relatorio-stat-label">Diárias</div>
                    </div>
                    <div class="relatorio-stat">
                        <div class="relatorio-stat-value">R$ ${item.totalValor.toFixed(2)}</div>
                        <div class="relatorio-stat-label">Total</div>
                    </div>
                    <div class="relatorio-stat">
                        <div class="relatorio-stat-value">R$ ${item.valorPago.toFixed(2)}</div>
                        <div class="relatorio-stat-label">Pago</div>
                    </div>
                </div>
            </div>
        `).join('') + `
            <div class="relatorio-total">
                <div class="relatorio-total-value">R$ ${totalGeral.toFixed(2)}</div>
                <div class="relatorio-total-label">Total Geral (R$ ${totalPago.toFixed(2)} pago)</div>
            </div>
        `;
    }

    gerarRelatorioManutencoes(dataInicio, dataFim) {
        const container = document.getElementById('relatorio-manutencoes');
        
        // Filtrar manutenções no período
        const manutencoesPeriodo = this.data.manutencoes.filter(m => {
            const dataManutencao = new Date(m.data);
            return dataManutencao >= new Date(dataInicio) && dataManutencao <= new Date(dataFim);
        });

        // Agrupar por veículo
        const relatorioManutencoes = {};
        manutencoesPeriodo.forEach(manutencao => {
            const veiculo = this.data.veiculos.find(v => v.id === manutencao.veiculoId);
            if (veiculo) {
                const veiculoKey = `${veiculo.marca} ${veiculo.modelo} - ${veiculo.placa}`;
                if (!relatorioManutencoes[veiculoKey]) {
                    relatorioManutencoes[veiculoKey] = {
                        veiculo,
                        manutencoes: [],
                        totalValor: 0,
                        totalManutencoes: 0
                    };
                }
                relatorioManutencoes[veiculoKey].manutencoes.push(manutencao);
                relatorioManutencoes[veiculoKey].totalValor += manutencao.valor;
                relatorioManutencoes[veiculoKey].totalManutencoes++;
            }
        });

        // Renderizar relatório
        const relatorioItems = Object.values(relatorioManutencoes)
            .sort((a, b) => b.totalValor - a.totalValor);

        if (relatorioItems.length === 0) {
            container.innerHTML = '<div class="empty-detail">Nenhuma manutenção encontrada no período selecionado</div>';
            return;
        }

        const totalGeral = relatorioItems.reduce((sum, item) => sum + item.totalValor, 0);
        const totalManutencoes = relatorioItems.reduce((sum, item) => sum + item.totalManutencoes, 0);

        container.innerHTML = relatorioItems.map(item => `
            <div class="relatorio-veiculo">
                <h3>${item.veiculo.marca} ${item.veiculo.modelo} - ${item.veiculo.placa}</h3>
                <div class="relatorio-item-stats">
                    <div class="relatorio-stat">
                        <span class="relatorio-stat-value">${item.totalManutencoes}</span>
                        <span class="relatorio-stat-label">Manutenções</span>
                    </div>
                    <div class="relatorio-stat">
                        <span class="relatorio-stat-value">R$ ${item.totalValor.toFixed(2)}</span>
                        <span class="relatorio-stat-label">Total Gasto</span>
                    </div>
                </div>
                <div class="manutencoes-list">
                    ${item.manutencoes.sort((a, b) => new Date(b.data) - new Date(a.data)).map(manutencao => `
                        <div class="manutencao-item ${manutencao.tipo.toLowerCase()}">
                            <div class="manutencao-info">
                                <div class="manutencao-tipo">${manutencao.tipo}</div>
                                <div class="manutencao-data">${this.formatDate(manutencao.data)}</div>
                                <div class="manutencao-descricao">${manutencao.descricao || 'Sem descrição'}</div>
                            </div>
                            <div class="manutencao-valor">R$ ${manutencao.valor.toFixed(2)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `).join('') + `
            <div class="relatorio-total">
                <div class="relatorio-total-label">Total Geral: ${totalManutencoes} manutenções - R$ ${totalGeral.toFixed(2)}</div>
            </div>
        `;
    }

    exportarRelatorios() {
        const dataInicio = document.getElementById('relatorio-data-inicio').value;
        const dataFim = document.getElementById('relatorio-data-fim').value;

        if (!dataInicio || !dataFim) {
            this.showMessage('Por favor, selecione as datas de início e fim', 'error');
            return;
        }

        try {
            const wb = XLSX.utils.book_new();
            
            // Relatório por Veículos
            const diariasPeriodo = this.data.diarias.filter(d => {
                const dataDiaria = new Date(d.data);
                return dataDiaria >= new Date(dataInicio) && dataDiaria <= new Date(dataFim);
            });

            const relatorioVeiculos = {};
            diariasPeriodo.forEach(diaria => {
                const veiculo = this.data.veiculos.find(v => v.id === diaria.veiculoId);
                if (veiculo) {
                    const veiculoKey = `${veiculo.marca} ${veiculo.modelo}`;
                    if (!relatorioVeiculos[veiculoKey]) {
                        relatorioVeiculos[veiculoKey] = {
                            veiculo: veiculoKey,
                            placa: veiculo.placa,
                            totalDiarias: 0,
                            totalValor: 0,
                            diariasPagas: 0,
                            valorPago: 0
                        };
                    }
                    relatorioVeiculos[veiculoKey].totalDiarias++;
                    relatorioVeiculos[veiculoKey].totalValor += diaria.valor;
                    if (diaria.status === 'Pago') {
                        relatorioVeiculos[veiculoKey].diariasPagas++;
                        relatorioVeiculos[veiculoKey].valorPago += diaria.valor;
                    }
                }
            });

            const relatorioMotoristas = {};
            diariasPeriodo.forEach(diaria => {
                const motorista = this.data.motoristas.find(m => m.id === diaria.motoristaId);
                if (motorista) {
                    if (!relatorioMotoristas[motorista.nome]) {
                        relatorioMotoristas[motorista.nome] = {
                            motorista: motorista.nome,
                            cpf: motorista.cpf,
                            totalDiarias: 0,
                            totalValor: 0,
                            diariasPagas: 0,
                            valorPago: 0
                        };
                    }
                    relatorioMotoristas[motorista.nome].totalDiarias++;
                    relatorioMotoristas[motorista.nome].totalValor += diaria.valor;
                    if (diaria.status === 'Pago') {
                        relatorioMotoristas[motorista.nome].diariasPagas++;
                        relatorioMotoristas[motorista.nome].valorPago += diaria.valor;
                    }
                }
            });

            const veiculosWS = XLSX.utils.json_to_sheet(Object.values(relatorioVeiculos));
            XLSX.utils.book_append_sheet(wb, veiculosWS, 'Relatório Veículos');

            const motoristasWS = XLSX.utils.json_to_sheet(Object.values(relatorioMotoristas));
            XLSX.utils.book_append_sheet(wb, motoristasWS, 'Relatório Motoristas');

            const now = new Date();
            const timestamp = now.toISOString().split('T')[0] + '_' + 
                            now.toTimeString().split(' ')[0].replace(/:/g, '-');
            const fileName = `Relatorios_${dataInicio}_a_${dataFim}_${timestamp}.xlsx`;
            
            XLSX.writeFile(wb, fileName);
            
            this.showMessage('Relatórios exportados para Excel com sucesso!', 'success');
        } catch (error) {
            this.showMessage('Erro ao exportar relatórios: ' + error.message, 'error');
        }
    }

    // Financeiro CRUD
    openFinanceiroModal(id = null) {
        const modal = document.getElementById('financeiro-modal');
        const title = document.getElementById('financeiro-modal-title');
        const form = document.getElementById('financeiro-form');

        if (id) {
            const financeiro = this.data.financeiro.find(f => f.id === id);
            if (financeiro) {
                title.textContent = 'Editar Transação';
                this.currentEditId = id;
                this.currentEditType = 'financeiro';
                
                document.getElementById('financeiro-descricao').value = financeiro.descricao;
                document.getElementById('financeiro-valor').value = financeiro.valor;
                document.getElementById('financeiro-data').value = financeiro.data;
                document.getElementById('financeiro-tipo').value = financeiro.tipo;
                document.getElementById('financeiro-categoria').value = financeiro.categoria;
            }
        } else {
            title.textContent = 'Nova Transação';
            this.currentEditId = null;
            this.currentEditType = null;
            form.reset();
            document.getElementById('financeiro-data').value = new Date().toISOString().split('T')[0];
        }

        modal.classList.add('show');
    }

    saveFinanceiro() {
        const formData = {
            descricao: document.getElementById('financeiro-descricao').value.trim(),
            valor: parseFloat(document.getElementById('financeiro-valor').value),
            data: document.getElementById('financeiro-data').value,
            tipo: document.getElementById('financeiro-tipo').value,
            categoria: document.getElementById('financeiro-categoria').value.trim()
        };

        // Validação de campos obrigatórios
        if (!formData.descricao) {
            this.showMessage('Descrição é obrigatória!', 'error');
            return;
        }

        if (!formData.valor || formData.valor <= 0) {
            this.showMessage('Valor deve ser maior que zero!', 'error');
            return;
        }

        if (!formData.data) {
            this.showMessage('Data é obrigatória!', 'error');
            return;
        }

        if (!formData.tipo) {
            this.showMessage('Tipo é obrigatório!', 'error');
            return;
        }

        if (this.currentEditId) {
            const index = this.data.financeiro.findIndex(f => f.id === this.currentEditId);
            if (index !== -1) {
                this.data.financeiro[index] = { ...formData, id: this.currentEditId };
            }
        } else {
            const newId = Math.max(...this.data.financeiro.map(f => f.id), 0) + 1;
            this.data.financeiro.push({ ...formData, id: newId });
        }

        this.saveData();
        this.renderFinanceiro();
        this.updateDashboard();
        this.closeFormModal('financeiro-modal');
        this.showMessage('Transação salva com sucesso!', 'success');
    }

    // Método de exclusão movido para executeDelete() com modal customizado

    renderFinanceiro() {
        const tbody = document.querySelector('#financeiro-table tbody');
        tbody.innerHTML = '';

        this.data.financeiro.forEach(financeiro => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${financeiro.descricao}</td>
                <td>R$ ${financeiro.valor.toFixed(2)}</td>
                <td>${this.formatDate(financeiro.data)}</td>
                <td><span class="status-badge status-${financeiro.tipo.toLowerCase()}">${financeiro.tipo}</span></td>
                <td>${financeiro.categoria}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-edit" data-action="edit" data-id="${financeiro.id}" data-type="financeiro">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-delete" data-action="delete" data-id="${financeiro.id}" data-type="financeiro">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Adicionar event listeners aos botões
        this.attachActionListeners(tbody);
    }

    filterFinanceiro() {
        const search = document.getElementById('search-financeiro').value.toLowerCase();
        const tipoFilter = document.getElementById('filter-tipo-financeiro').value;
        const categoriaFilter = document.getElementById('filter-categoria-financeiro').value;
        
        const filtered = this.data.financeiro.filter(financeiro => {
            const matchesSearch = financeiro.descricao.toLowerCase().includes(search);
            const matchesTipo = !tipoFilter || financeiro.tipo === tipoFilter;
            const matchesCategoria = !categoriaFilter || financeiro.categoria === categoriaFilter;
            
            return matchesSearch && matchesTipo && matchesCategoria;
        });

        this.renderFilteredFinanceiro(filtered);
    }

    renderFilteredFinanceiro(financeiro) {
        const tbody = document.querySelector('#financeiro-table tbody');
        tbody.innerHTML = '';

        financeiro.forEach(f => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${f.descricao}</td>
                <td>R$ ${f.valor.toFixed(2)}</td>
                <td>${this.formatDate(f.data)}</td>
                <td><span class="status-badge status-${f.tipo.toLowerCase()}">${f.tipo}</span></td>
                <td>${f.categoria}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-sm btn-edit" data-action="edit" data-id="${f.id}" data-type="financeiro">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="btn btn-sm btn-delete" data-action="delete" data-id="${f.id}" data-type="financeiro">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            `;
            tbody.appendChild(row);
        });

        // Adicionar event listeners aos botões
        this.attachActionListeners(tbody);
    }

    // Dashboard
    updateDashboard() {
        // Verificar se as propriedades existem antes de usar filter
        const totalMotoristas = (this.data.motoristas || []).filter(m => m.status === 'Ativo').length;
        const totalVeiculos = (this.data.veiculos || []).filter(v => v.status === 'Ativo').length;
        const totalContratos = (this.data.contratos || []).filter(c => c.status === 'Ativo').length;
        
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();
        
        // Total de diárias do mês
        const totalDiarias = (this.data.diarias || []).filter(d => {
            const diariaDate = new Date(d.data);
            return diariaDate.getMonth() === currentMonth && diariaDate.getFullYear() === currentYear;
        }).length;
        
        // Receita total do mês (financeiro + diárias pagas)
        const receitaFinanceiro = (this.data.financeiro || []).filter(f => {
            const financeiroDate = new Date(f.data);
            return f.tipo === 'Receita' && 
                   financeiroDate.getMonth() === currentMonth && 
                   financeiroDate.getFullYear() === currentYear;
        }).reduce((sum, f) => sum + f.valor, 0);
        
        const receitaDiarias = (this.data.diarias || []).filter(d => {
            const diariaDate = new Date(d.data);
            return d.status === 'Pago' && 
                   diariaDate.getMonth() === currentMonth && 
                   diariaDate.getFullYear() === currentYear;
        }).reduce((sum, d) => sum + d.valor, 0);
        
        const receitaTotal = receitaFinanceiro + receitaDiarias;

        document.getElementById('total-motoristas').textContent = totalMotoristas;
        document.getElementById('total-veiculos').textContent = totalVeiculos;
        document.getElementById('total-diarias').textContent = totalDiarias;
        document.getElementById('total-contratos').textContent = totalContratos;
        document.getElementById('receita-mes').textContent = `R$ ${receitaTotal.toFixed(2)}`;
        
        // Atualizar gráficos
        this.updateCharts();
        
        // Atualizar detalhes
        this.updateDetails();
    }

    setupCharts() {
        // Simple chart implementation using canvas
        this.updateCharts();
    }

    updateCharts() {
        this.drawReceitasChart();
        this.drawManutencoesChart();
    }

    updateDetails() {
        this.updateUltimasManutencoes();
        this.updateDiariasPendentes();
        this.updateStatusVeiculos();
        this.updateContratosVencendo();
        this.updateProgressoContratos();
        this.updateDisponibilidadeVeiculos();
        this.updateUtilizacaoVeiculos();
        this.updateResumoFinanceiro();
    }

    updateUltimasManutencoes() {
        const container = document.getElementById('ultimas-manutencoes');
        if (!container) return;

        // Pegar as 5 manutenções mais recentes
        const ultimasManutencoes = this.data.manutencoes
            .sort((a, b) => new Date(b.data) - new Date(a.data))
            .slice(0, 5);

        if (ultimasManutencoes.length === 0) {
            container.innerHTML = '<div class="empty-detail">Nenhuma manutenção registrada</div>';
            return;
        }

        container.innerHTML = ultimasManutencoes.map(manutencao => {
            const veiculo = this.data.veiculos.find(v => v.id === manutencao.veiculoId);
            const veiculoNome = veiculo ? `${veiculo.marca} ${veiculo.modelo}` : 'Veículo não encontrado';
            const data = this.formatDate(manutencao.data);
            
            return `
                <div class="detail-item">
                    <div class="detail-item-info">
                        <div class="detail-item-title">${veiculoNome}</div>
                        <div class="detail-item-subtitle">${manutencao.tipo} - ${data}</div>
                    </div>
                    <div class="detail-item-value">R$ ${manutencao.valor.toFixed(2)}</div>
                </div>
            `;
        }).join('');
    }

    updateDiariasPendentes() {
        const container = document.getElementById('diarias-pendentes');
        if (!container) return;

        // Pegar diárias pendentes
        const diariasPendentes = this.data.diarias
            .filter(d => d.status === 'Pendente')
            .sort((a, b) => new Date(a.data) - new Date(b.data))
            .slice(0, 5);

        if (diariasPendentes.length === 0) {
            container.innerHTML = '<div class="empty-detail">Nenhuma diária pendente</div>';
            return;
        }

        container.innerHTML = diariasPendentes.map(diaria => {
            const motorista = this.data.motoristas.find(m => m.id === diaria.motoristaId);
            const motoristaNome = motorista ? motorista.nome : 'Motorista não encontrado';
            const data = this.formatDate(diaria.data);
            
            return `
                <div class="detail-item">
                    <div class="detail-item-info">
                        <div class="detail-item-title">${motoristaNome}</div>
                        <div class="detail-item-subtitle">${data}</div>
                    </div>
                    <div class="detail-item-value">R$ ${diaria.valor.toFixed(2)}</div>
                </div>
            `;
        }).join('');
    }

    updateStatusVeiculos() {
        const container = document.getElementById('status-veiculos');
        if (!container) return;

        // Contar veículos por status
        const statusCount = this.data.veiculos.reduce((acc, veiculo) => {
            acc[veiculo.status] = (acc[veiculo.status] || 0) + 1;
            return acc;
        }, {});

        if (Object.keys(statusCount).length === 0) {
            container.innerHTML = '<div class="empty-detail">Nenhum veículo cadastrado</div>';
            return;
        }

        container.innerHTML = Object.entries(statusCount).map(([status, count]) => {
            const statusClass = status.toLowerCase().replace(' ', '');
            return `
                <div class="detail-item">
                    <div class="detail-item-info">
                        <div class="detail-item-title">${status}</div>
                    </div>
                    <div class="detail-item-value">${count}</div>
                </div>
            `;
        }).join('');
    }

    updateContratosVencendo() {
        const container = document.getElementById('contratos-vencendo');
        if (!container) return;

        const hoje = new Date();
        const contratosVencendo = this.data.contratos
            .filter(c => c.status === 'Ativo')
            .map(contrato => {
                const vencimento = new Date(contrato.dataVencimento);
                const diasParaVencimento = Math.ceil((vencimento - hoje) / (1000 * 60 * 60 * 24));
                return { ...contrato, diasParaVencimento };
            })
            .filter(c => c.diasParaVencimento <= 10)
            .sort((a, b) => a.diasParaVencimento - b.diasParaVencimento)
            .slice(0, 5);

        if (contratosVencendo.length === 0) {
            container.innerHTML = '<div class="empty-detail">Nenhum contrato vencendo em breve</div>';
            return;
        }

        container.innerHTML = contratosVencendo.map(contrato => {
            const veiculo = this.data.veiculos.find(v => v.id === contrato.veiculoId);
            const motorista = this.data.motoristas.find(m => m.id === contrato.motoristaId);
            const veiculoNome = veiculo ? `${veiculo.marca} ${veiculo.modelo}` : 'Veículo não encontrado';
            const motoristaNome = motorista ? motorista.nome : 'Motorista não encontrado';
            
            const farolClass = contrato.diasParaVencimento <= 0 ? 'farol-vermelho' : 
                              contrato.diasParaVencimento <= 3 ? 'farol-amarelo' : 'farol-verde';
            
            return `
                <div class="detail-item">
                    <div class="detail-item-info">
                        <div class="detail-item-title">${veiculoNome}</div>
                        <div class="detail-item-subtitle">${motoristaNome}</div>
                    </div>
                    <div class="detail-item-value">
                        <span class="farol ${farolClass}"></span>
                        ${contrato.diasParaVencimento <= 0 ? 'Vencido' : `${contrato.diasParaVencimento} dias`}
                    </div>
                </div>
            `;
        }).join('');
    }

    updateProgressoContratos() {
        const container = document.getElementById('progresso-contratos');
        if (!container) return;

        const contratosAtivos = this.data.contratos.filter(c => c.status === 'Ativo');

        if (contratosAtivos.length === 0) {
            container.innerHTML = '<div class="empty-detail">Nenhum contrato ativo</div>';
            return;
        }

        container.innerHTML = contratosAtivos.map(contrato => {
            const motorista = this.data.motoristas.find(m => m.id === contrato.motoristaId);
            const veiculo = this.data.veiculos.find(v => v.id === contrato.veiculoId);
            const progresso = this.calcularProgressoContrato(contrato);
            
            // Determinar cor da barra baseada no progresso
            let corBarra = '';
            if (progresso.percentualPago >= 80) {
                corBarra = 'vermelho';
            } else if (progresso.percentualPago >= 50) {
                corBarra = 'amarelo';
            }

            return `
                <div class="progresso-contrato">
                    <h4>${motorista ? motorista.nome : 'Motorista não encontrado'}</h4>
                    <div class="progresso-info">
                        <span>${veiculo ? veiculo.marca + ' ' + veiculo.modelo : 'Veículo não encontrado'}</span>
                        <span>${progresso.diariasPagas}/${progresso.totalDiarias} diárias</span>
                    </div>
                    <div class="progress-bar-container">
                        <div class="progress-bar ${corBarra}" style="width: ${progresso.percentualPago}%">
                            ${Math.round(progresso.percentualPago)}%
                        </div>
                    </div>
                    <div class="valores-contrato">
                        <div class="valor-item">
                            <span>Total:</span>
                            <span>R$ ${progresso.valorTotalContrato.toFixed(2)}</span>
                        </div>
                        <div class="valor-item pago">
                            <span>Pago:</span>
                            <span>R$ ${progresso.valorPago.toFixed(2)}</span>
                        </div>
                        <div class="valor-item restante">
                            <span>Restante:</span>
                            <span>R$ ${progresso.valorRestante.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Método para calcular disponibilidade dos veículos
    calcularDisponibilidadeVeiculo(veiculo) {
        const hoje = new Date();
        
        // Buscar a data de início do contrato mais antigo para este veículo
        const contratosVeiculo = this.data.contratos.filter(c => c.veiculoId === veiculo.id);
        let dataInicio;
        
        if (contratosVeiculo.length > 0) {
            // Usar a data de início do contrato mais antigo
            const dataContratoMaisAntigo = Math.min(...contratosVeiculo.map(c => new Date(c.dataInicio)));
            dataInicio = new Date(dataContratoMaisAntigo);
        } else {
            // Se não há contratos, usar data de cadastro do veículo ou data atual
            dataInicio = new Date(veiculo.dataCadastro || hoje);
        }
        
        const diasTotais = Math.ceil((hoje - dataInicio) / (1000 * 60 * 60 * 24));
        
        // Buscar todas as manutenções do veículo no período do contrato
        const manutencoes = this.data.manutencoes.filter(m => {
            const dataManutencao = new Date(m.data);
            return m.veiculoId === veiculo.id && 
                   dataManutencao >= dataInicio && 
                   dataManutencao <= hoje;
        });
        
        // Calcular dias em manutenção (assumindo 1 dia por manutenção)
        const diasManutencao = manutencoes.length;
        
        // Calcular dias disponíveis
        const diasDisponiveis = diasTotais - diasManutencao;
        
        // Calcular percentual de disponibilidade
        const percentualDisponibilidade = diasTotais > 0 ? (diasDisponiveis / diasTotais) * 100 : 100;
        
        // Calcular valor total gasto em manutenções
        const valorTotalManutencao = manutencoes.reduce((total, m) => total + m.valor, 0);
        
        return {
            diasTotais,
            diasDisponiveis,
            diasManutencao,
            percentualDisponibilidade,
            valorTotalManutencao,
            manutencoes
        };
    }

    updateDisponibilidadeVeiculos() {
        const container = document.getElementById('disponibilidade-veiculos');
        if (!container) return;

        const veiculosAtivos = this.data.veiculos.filter(v => v.status === 'Ativo');

        if (veiculosAtivos.length === 0) {
            container.innerHTML = '<div class="empty-detail">Nenhum veículo ativo</div>';
            return;
        }

        container.innerHTML = veiculosAtivos.map(veiculo => {
            const disponibilidade = this.calcularDisponibilidadeVeiculo(veiculo);
            
            // Determinar cor da barra baseada na disponibilidade
            let corBarra = '';
            if (disponibilidade.percentualDisponibilidade >= 80) {
                corBarra = '';
            } else if (disponibilidade.percentualDisponibilidade >= 60) {
                corBarra = 'media';
            } else {
                corBarra = 'baixa';
            }

            return `
                <div class="disponibilidade-veiculo">
                    <h4>${veiculo.marca} ${veiculo.modelo} - ${veiculo.placa}</h4>
                    <div class="disponibilidade-stats">
                        <div class="disponibilidade-stat disponivel">
                            <div class="stat-value">${disponibilidade.diasDisponiveis}</div>
                            <div class="stat-label">Dias Disponível</div>
                        </div>
                        <div class="disponibilidade-stat manutencao">
                            <div class="stat-value">${disponibilidade.diasManutencao}</div>
                            <div class="stat-label">Dias Manutenção</div>
                        </div>
                        <div class="disponibilidade-stat total">
                            <div class="stat-value">${disponibilidade.diasTotais}</div>
                            <div class="stat-label">Total Dias</div>
                        </div>
                    </div>
                    <div class="disponibilidade-bar">
                        <div class="disponibilidade-bar-fill ${corBarra}" style="width: ${disponibilidade.percentualDisponibilidade}%"></div>
                    </div>
                    <div class="disponibilidade-info">
                        <span>Disponibilidade: ${Math.round(disponibilidade.percentualDisponibilidade)}%</span>
                        <span>Gasto em Manutenção: R$ ${disponibilidade.valorTotalManutencao.toFixed(2)}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateUtilizacaoVeiculos() {
        const container = document.getElementById('utilizacao-veiculos');
        if (!container) return;

        const hoje = new Date();
        const utilizacaoData = this.data.veiculos.map(veiculo => {
            // Calcular dias de utilização (diárias pagas)
            const diariasPagas = this.data.diarias.filter(d => 
                d.veiculoId === veiculo.id && d.status === 'Pago'
            );
            const diasUtilizacao = diariasPagas.length;

            // Calcular dias em manutenção
            const manutencoes = this.data.manutencoes.filter(m => 
                m.veiculoId === veiculo.id
            );
            const diasManutencao = manutencoes.length;

            // Calcular dias totais desde o cadastro
            const dataCadastro = new Date(veiculo.dataCadastro || '2024-01-01');
            const diasTotais = Math.ceil((hoje - dataCadastro) / (1000 * 60 * 60 * 24));

            // Calcular percentual de utilização
            const percentualUtilizacao = diasTotais > 0 ? (diasUtilizacao / diasTotais) * 100 : 0;
            const percentualManutencao = diasTotais > 0 ? (diasManutencao / diasTotais) * 100 : 0;

            return {
                veiculo,
                diasUtilizacao,
                diasManutencao,
                diasTotais,
                percentualUtilizacao,
                percentualManutencao
            };
        }).sort((a, b) => b.percentualUtilizacao - a.percentualUtilizacao);

        if (utilizacaoData.length === 0) {
            container.innerHTML = '<div class="empty-detail">Nenhum veículo cadastrado</div>';
            return;
        }

        container.innerHTML = utilizacaoData.map(item => {
            const { veiculo, diasUtilizacao, diasManutencao, percentualUtilizacao, percentualManutencao } = item;
            
            return `
                <div class="utilizacao-item">
                    <div class="utilizacao-item-info">
                        <div class="utilizacao-item-title">${veiculo.marca} ${veiculo.modelo}</div>
                        <div class="utilizacao-item-subtitle">${veiculo.placa} - ${veiculo.status}</div>
                    </div>
                    <div class="utilizacao-stats">
                        <div class="utilizacao-stat">
                            <div class="utilizacao-stat-value">${diasUtilizacao}</div>
                            <div class="utilizacao-stat-label">Dias Ativos</div>
                            <div class="utilizacao-bar">
                                <div class="utilizacao-bar-fill" style="width: ${Math.min(percentualUtilizacao, 100)}%"></div>
                            </div>
                        </div>
                        <div class="utilizacao-stat">
                            <div class="utilizacao-stat-value">${diasManutencao}</div>
                            <div class="utilizacao-stat-label">Manutenções</div>
                            <div class="utilizacao-bar">
                                <div class="utilizacao-bar-fill manutencao" style="width: ${Math.min(percentualManutencao, 100)}%"></div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }

    updateResumoFinanceiro() {
        const container = document.getElementById('resumo-financeiro');
        if (!container) return;

        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        // Receitas do mês
        const receitasMes = this.data.financeiro.filter(f => {
            const date = new Date(f.data);
            return f.tipo === 'Receita' && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        }).reduce((sum, f) => sum + f.valor, 0);

        // Despesas do mês
        const despesasMes = this.data.financeiro.filter(f => {
            const date = new Date(f.data);
            return f.tipo === 'Despesa' && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        }).reduce((sum, f) => sum + f.valor, 0);

        // Manutenções do mês
        const manutencoesMes = this.data.manutencoes.filter(m => {
            const date = new Date(m.data);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        }).reduce((sum, m) => sum + m.valor, 0);

        // Diárias pagas do mês
        const diariasPagasMes = this.data.diarias.filter(d => {
            const date = new Date(d.data);
            return d.status === 'Pago' && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        }).reduce((sum, d) => sum + d.valor, 0);

        const saldo = receitasMes + diariasPagasMes - despesasMes - manutencoesMes;

        container.innerHTML = `
            <div class="detail-item">
                <div class="detail-item-info">
                    <div class="detail-item-title">Receitas</div>
                </div>
                <div class="detail-item-value" style="color: #40c057;">R$ ${(receitasMes + diariasPagasMes).toFixed(2)}</div>
            </div>
            <div class="detail-item">
                <div class="detail-item-info">
                    <div class="detail-item-title">Despesas</div>
                </div>
                <div class="detail-item-value" style="color: #ee5a52;">R$ ${(despesasMes + manutencoesMes).toFixed(2)}</div>
            </div>
            <div class="detail-item">
                <div class="detail-item-info">
                    <div class="detail-item-title">Saldo do Mês</div>
                </div>
                <div class="detail-item-value" style="color: ${saldo >= 0 ? '#40c057' : '#ee5a52'};">R$ ${saldo.toFixed(2)}</div>
            </div>
        `;
    }

    drawReceitasChart() {
        const canvas = document.getElementById('receitasChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        // Receitas do financeiro
        const receitasFinanceiro = this.data.financeiro.filter(f => {
            const date = new Date(f.data);
            return f.tipo === 'Receita' && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        }).reduce((sum, f) => sum + f.valor, 0);

        // Receitas das diárias pagas
        const receitasDiarias = this.data.diarias.filter(d => {
            const date = new Date(d.data);
            return d.status === 'Pago' && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        }).reduce((sum, d) => sum + d.valor, 0);

        const receitas = receitasFinanceiro + receitasDiarias;

        // Despesas do financeiro
        const despesasFinanceiro = this.data.financeiro.filter(f => {
            const date = new Date(f.data);
            return f.tipo === 'Despesa' && date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        }).reduce((sum, f) => sum + f.valor, 0);

        // Despesas das manutenções
        const despesasManutencoes = this.data.manutencoes.filter(m => {
            const date = new Date(m.data);
            return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
        }).reduce((sum, m) => sum + m.valor, 0);

        const despesas = despesasFinanceiro + despesasManutencoes;

        // Calcular saldo
        const saldo = receitas - despesas;
        
        const maxValue = Math.max(receitas, despesas) || 1;
        const barHeight = 120;
        const barWidth = 80;
        const barSpacing = 40;
        const chartStartY = canvas.height - 60;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Desenhar eixos
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(30, 20);
        ctx.lineTo(30, chartStartY);
        ctx.lineTo(canvas.width - 20, chartStartY);
        ctx.stroke();
        
        // Receitas bar
        const receitasHeight = (receitas / maxValue) * barHeight;
        const receitasX = 50;
        
        // Gradiente para receitas
        const receitasGradient = ctx.createLinearGradient(0, chartStartY - receitasHeight, 0, chartStartY);
        receitasGradient.addColorStop(0, '#51cf66');
        receitasGradient.addColorStop(1, '#40c057');
        
        ctx.fillStyle = receitasGradient;
        ctx.fillRect(receitasX, chartStartY - receitasHeight, barWidth, receitasHeight);
        
        // Sombra
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(receitasX + 2, chartStartY - receitasHeight + 2, barWidth, receitasHeight);
        
        // Texto receitas
        ctx.fillStyle = '#333';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Receitas', receitasX + barWidth/2, chartStartY + 20);
        ctx.font = '11px Arial';
        ctx.fillText(`R$ ${receitas.toFixed(2)}`, receitasX + barWidth/2, chartStartY + 35);

        // Despesas bar
        const despesasHeight = (despesas / maxValue) * barHeight;
        const despesasX = receitasX + barWidth + barSpacing;
        
        // Gradiente para despesas
        const despesasGradient = ctx.createLinearGradient(0, chartStartY - despesasHeight, 0, chartStartY);
        despesasGradient.addColorStop(0, '#ff6b6b');
        despesasGradient.addColorStop(1, '#ee5a52');
        
        ctx.fillStyle = despesasGradient;
        ctx.fillRect(despesasX, chartStartY - despesasHeight, barWidth, despesasHeight);
        
        // Sombra
        ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.fillRect(despesasX + 2, chartStartY - despesasHeight + 2, barWidth, despesasHeight);
        
        // Texto despesas
        ctx.fillStyle = '#333';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Despesas', despesasX + barWidth/2, chartStartY + 20);
        ctx.font = '11px Arial';
        ctx.fillText(`R$ ${despesas.toFixed(2)}`, despesasX + barWidth/2, chartStartY + 35);
        
        // Saldo
        ctx.fillStyle = saldo >= 0 ? '#51cf66' : '#ff6b6b';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(`Saldo: R$ ${saldo.toFixed(2)}`, canvas.width/2, 15);
        
        // Se não há dados, mostrar mensagem
        if (receitas === 0 && despesas === 0) {
            ctx.fillStyle = '#999';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Nenhuma transação registrada', canvas.width/2, canvas.height/2);
        }
    }

    drawManutencoesChart() {
        const canvas = document.getElementById('manutencoesChart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        const currentYear = new Date().getFullYear();
        
        // Calcular manutenções por mês e valores
        const manutencoesPorMes = Array(12).fill(0);
        const valoresPorMes = Array(12).fill(0);
        
        this.data.manutencoes.forEach(manutencao => {
            const date = new Date(manutencao.data);
            if (date.getFullYear() === currentYear) {
                const month = date.getMonth();
                manutencoesPorMes[month]++;
                valoresPorMes[month] += manutencao.valor;
            }
        });

        const maxCount = Math.max(...manutencoesPorMes) || 1;
        const maxValue = Math.max(...valoresPorMes) || 1;
        const barWidth = 20;
        const barSpacing = 5;
        const chartHeight = 100;
        const chartStartY = canvas.height - 80;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Título do gráfico
        ctx.fillStyle = '#333';
        ctx.font = 'bold 12px Arial';
        ctx.textAlign = 'left';
        ctx.fillText('Manutenções por Mês', 20, 15);
        
        // Desenhar eixos
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(30, 25);
        ctx.lineTo(30, chartStartY);
        ctx.lineTo(canvas.width - 20, chartStartY);
        ctx.stroke();
        
        // Desenhar barras
        manutencoesPorMes.forEach((count, month) => {
            const x = 35 + month * (barWidth + barSpacing);
            
            if (count > 0) {
                const height = (count / maxCount) * chartHeight;
                
                // Cor baseada no valor (mais caro = mais escuro)
                const intensity = valoresPorMes[month] / maxValue;
                const blue = Math.floor(59 + intensity * 100);
                const green = Math.floor(130 + intensity * 50);
                const red = Math.floor(246 - intensity * 50);
                
                ctx.fillStyle = `rgb(${red}, ${green}, ${blue})`;
                ctx.fillRect(x, chartStartY - height, barWidth, height);
                
                // Valor no topo da barra
                ctx.fillStyle = '#333';
                ctx.font = 'bold 9px Arial';
                ctx.textAlign = 'center';
                ctx.fillText(count.toString(), x + barWidth/2, chartStartY - height - 5);
            } else {
                // Desenhar barra vazia
                ctx.strokeStyle = '#eee';
                ctx.lineWidth = 1;
                ctx.strokeRect(x, chartStartY - 5, barWidth, 5);
            }
        });
        
        // Nomes dos meses
        const monthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 
                           'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        
        ctx.fillStyle = '#666';
        ctx.font = '9px Arial';
        ctx.textAlign = 'center';
        
        monthNames.forEach((name, month) => {
            const x = 35 + month * (barWidth + barSpacing) + barWidth/2;
            ctx.fillText(name, x, chartStartY + 15);
        });
        
        // Legenda no rodapé
        const totalManutencoes = manutencoesPorMes.reduce((sum, count) => sum + count, 0);
        const totalValor = valoresPorMes.reduce((sum, valor) => sum + valor, 0);
        
        ctx.fillStyle = '#333';
        ctx.font = '10px Arial';
        ctx.textAlign = 'left';
        ctx.fillText(`Total: ${totalManutencoes} manutenções`, 20, canvas.height - 20);
        ctx.textAlign = 'right';
        ctx.fillText(`R$ ${totalValor.toFixed(2)}`, canvas.width - 20, canvas.height - 20);
        
        // Se não há dados, mostrar mensagem
        if (totalManutencoes === 0) {
            ctx.fillStyle = '#999';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('Nenhuma manutenção registrada', canvas.width/2, canvas.height/2);
        }
    }

    // Modal Management
    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            // Remover classe show
        modal.classList.remove('show');
            
            // Forçar remoção de todos os estilos inline
            modal.style.display = 'none';
            modal.style.visibility = 'hidden';
            modal.style.opacity = '0';
            modal.style.zIndex = '';
            
            // Debug: verificar se o modal foi fechado
            console.log(`Modal ${modalId} fechado`);
            
            // Forçar re-renderização
            setTimeout(() => {
                modal.style.display = '';
                modal.style.visibility = '';
                modal.style.opacity = '';
            }, 100);
        } else {
            console.error(`Modal ${modalId} não encontrado`);
        }
        this.currentEditId = null;
        this.currentEditType = null;
    }

    // Método específico para fechar modais de formulário
    closeFormModal(modalId) {
        console.log(`🔒 Fechando modal: ${modalId}`);
        const modal = document.getElementById(modalId);
        if (modal) {
            // Múltiplas abordagens para garantir fechamento
            modal.classList.remove('show');
            modal.style.display = 'none';
            modal.style.visibility = 'hidden';
            modal.style.opacity = '0';
            modal.style.zIndex = '-1';
            
            // Reset do formulário
            const form = modal.querySelector('form');
            if (form) {
                form.reset();
                console.log(`📝 Formulário ${modalId} resetado`);
            }
            
            // Limpar estado de edição
            this.currentEditId = null;
            this.currentEditType = null;
            
            // Forçar re-renderização
            setTimeout(() => {
                modal.style.display = '';
                modal.style.visibility = '';
                modal.style.opacity = '';
                modal.style.zIndex = '';
                console.log(`✅ Modal ${modalId} estilos resetados`);
            }, 100);
            
            console.log(`✅ Modal ${modalId} fechado com sucesso`);
        } else {
            console.error(`❌ Modal ${modalId} não encontrado!`);
        }
    }

    showMessage(message, type = 'success') {
        // Create message element
        const messageEl = document.createElement('div');
        messageEl.className = `message message-${type}`;
        messageEl.textContent = message;
        
        // Insert at top of main content
        const mainContent = document.querySelector('.main-content');
        mainContent.insertBefore(messageEl, mainContent.firstChild);
        
        // Remove after 3 seconds
        setTimeout(() => {
            messageEl.remove();
        }, 3000);
    }

    // Excel Export
    exportToExcel() {
        try {
            const wb = XLSX.utils.book_new();
            
            // Motoristas sheet
            const motoristasWS = XLSX.utils.json_to_sheet(this.data.motoristas);
            XLSX.utils.book_append_sheet(wb, motoristasWS, 'Motoristas');
            
            // Veículos sheet
            const veiculosWS = XLSX.utils.json_to_sheet(this.data.veiculos);
            XLSX.utils.book_append_sheet(wb, veiculosWS, 'Veículos');
            
            // Diárias sheet
            const diariasWS = XLSX.utils.json_to_sheet(this.data.diarias);
            XLSX.utils.book_append_sheet(wb, diariasWS, 'Diárias');
            
            // Manutenções sheet
            const manutencoesWS = XLSX.utils.json_to_sheet(this.data.manutencoes);
            XLSX.utils.book_append_sheet(wb, manutencoesWS, 'Manutenções');
            
            // Contratos sheet
            const contratosWS = XLSX.utils.json_to_sheet(this.data.contratos);
            XLSX.utils.book_append_sheet(wb, contratosWS, 'Contratos');
            
            // Financeiro sheet
            const financeiroWS = XLSX.utils.json_to_sheet(this.data.financeiro);
            XLSX.utils.book_append_sheet(wb, financeiroWS, 'Financeiro');
            
            // Save file with timestamp
            const now = new Date();
            const timestamp = now.toISOString().split('T')[0] + '_' + 
                            now.toTimeString().split(' ')[0].replace(/:/g, '-');
            const fileName = `SisRealDriver_Export_${timestamp}.xlsx`;
            
            XLSX.writeFile(wb, fileName);
            
            this.showMessage('Dados exportados para Excel com sucesso!', 'success');
        } catch (error) {
            this.showMessage('Erro ao exportar dados: ' + error.message, 'error');
        }
    }

    // System Backup (Manual)
    backupSystem() {
        try {
            const backupData = {
                version: '1.0',
                timestamp: new Date().toISOString(),
                data: this.data,
                metadata: {
                    totalMotoristas: this.data.motoristas.length,
                    totalVeiculos: this.data.veiculos.length,
                    totalDiarias: this.data.diarias.length,
                    totalManutencoes: this.data.manutencoes.length,
                    totalContratos: this.data.contratos.length,
                    totalFinanceiro: this.data.financeiro.length
                }
            };

            const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const now = new Date();
            const timestamp = now.toISOString().split('T')[0] + '_' + 
                            now.toTimeString().split(' ')[0].replace(/:/g, '-');
            const fileName = `SisRealDriver_Backup_${timestamp}.json`;
            
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showMessage('Backup do sistema criado com sucesso!', 'success');
        } catch (error) {
            this.showMessage('Erro ao criar backup: ' + error.message, 'error');
        }
    }

    // Manual Auto Backup (Download file)
    downloadAutoBackup() {
        try {
            const autoBackup = localStorage.getItem('sisRealDriverAutoBackup');
            if (!autoBackup) {
                this.showMessage('Nenhum backup automático encontrado', 'error');
                return;
            }

            const backupData = JSON.parse(autoBackup);
            const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            
            const now = new Date();
            const timestamp = now.toISOString().split('T')[0] + '_' + 
                            now.toTimeString().split(' ')[0].replace(/:/g, '-');
            const fileName = `BackupAuto_${timestamp}.json`;
            
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            this.showMessage('Backup automático baixado com sucesso!', 'success');
        } catch (error) {
            this.showMessage('Erro ao baixar backup: ' + error.message, 'error');
        }
    }

    // Perform Auto Backup on Every Execution
    performAutoBackup() {
        try {
            const backupData = {
                version: '1.0',
                timestamp: new Date().toISOString(),
                data: this.data,
                autoBackup: true,
                executionTime: new Date().toLocaleString()
            };

            // Save to localStorage as auto backup (silent)
            localStorage.setItem('sisRealDriverAutoBackup', JSON.stringify(backupData));
            
            // Save to IndexedDB for offline access
            this.saveToIndexedDB(backupData);
            
            console.log('Backup automático realizado silenciosamente:', new Date().toLocaleString());
            console.log('Backup salvo no navegador (localStorage + IndexedDB)');
            console.log('Para arquivo físico, use o botão "Baixar Auto Backup" ou execute mover_backups.bat');
            
        } catch (error) {
            console.error('Erro no backup automático:', error);
        }
    }


    // Save to IndexedDB as fallback
    async saveToIndexedDB(backupData) {
        try {
            const request = indexedDB.open('SisRealDriverBackups', 1);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('backups')) {
                    db.createObjectStore('backups', { keyPath: 'timestamp' });
                }
            };
            
            request.onsuccess = (event) => {
                const db = event.target.result;
                const transaction = db.transaction(['backups'], 'readwrite');
                const store = transaction.objectStore('backups');
                store.put(backupData);
            };
            
        } catch (error) {
            console.error('Erro ao salvar no IndexedDB:', error);
        }
    }



    // Restore System
    restoreSystem() {
        document.getElementById('backup-file-input').click();
    }

    handleBackupRestore(file) {
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const backupData = JSON.parse(e.target.result);
                
                // Validate backup file
                if (!backupData.version || !backupData.data) {
                    throw new Error('Arquivo de backup inválido');
                }

                // Confirm restore
                const confirmMessage = `Tem certeza que deseja restaurar o backup?\n\n` +
                    `Data do backup: ${new Date(backupData.timestamp).toLocaleString()}\n` +
                    `Motoristas: ${backupData.metadata?.totalMotoristas || 'N/A'}\n` +
                    `Veículos: ${backupData.metadata?.totalVeiculos || 'N/A'}\n` +
                    `Diárias: ${backupData.metadata?.totalDiarias || 'N/A'}\n` +
                    `Manutenções: ${backupData.metadata?.totalManutencoes || 'N/A'}\n` +
                    `Contratos: ${backupData.metadata?.totalContratos || 'N/A'}\n` +
                    `Financeiro: ${backupData.metadata?.totalFinanceiro || 'N/A'}\n\n` +
                    `⚠️ ATENÇÃO: Todos os dados atuais serão substituídos!`;

                if (confirm(confirmMessage)) {
                    this.data = backupData.data;
                    this.saveData();
                    
                    // Reload current tab
                    this.loadTabData(document.querySelector('.nav-tab.active').dataset.tab);
                    this.updateDashboard();
                    
                    this.showMessage('Sistema restaurado com sucesso!', 'success');
                }
            } catch (error) {
                this.showMessage('Erro ao restaurar backup: ' + error.message, 'error');
            }
        };
        reader.readAsText(file);
    }
}

// Global functions for HTML onclick events
function openMotoristaModal(id) {
    if (window.app) {
        window.app.openMotoristaModal(id);
    }
}

function openVeiculoModal(id) {
    if (window.app) {
        window.app.openVeiculoModal(id);
    }
}

function openDiariaModal(id) {
    if (window.app) {
        window.app.openDiariaModal(id);
    }
}

function openManutencaoModal(id) {
    if (window.app) {
        window.app.openManutencaoModal(id);
    }
}

function openContratoModal(id) {
    console.log('🌐 Função global openContratoModal chamada, ID:', id);
    if (window.app) {
        window.app.openContratoModal(id);
    } else {
        console.error('❌ App não inicializada');
    }
}

function openFinanceiroModal(id) {
    if (window.app) {
        window.app.openFinanceiroModal(id);
    }
}

function closeModal(modalId) {
    if (window.app) {
        window.app.closeModal(modalId);
    }
}

function exportToExcel() {
    app.exportToExcel();
}

function backupSystem() {
    app.backupSystem();
}

function downloadAutoBackup() {
    app.downloadAutoBackup();
}

function restoreSystem() {
    app.restoreSystem();
}

function updateDashboard() {
    app.updateDashboard();
}

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    console.log('🚀 Inicializando SisRealDriver...');
    window.app = new SisRealDriver();
    console.log('✅ SisRealDriver inicializado');
});

// Event listeners are now handled by the app instance

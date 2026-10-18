# Decisões de Projeto

Neste documento, detalho as escolhas técnicas e arquiteturais que tomei durante o desenvolvimento deste projeto.

### Decisões Técnicas
- **Uso de Enums:** Optei por utilizar enums para facilitar a validação de entrada e saída de dados. Isso me permite padronizar termos internamente (inclusive em inglês no banco de dados) enquanto mantenho o CSV em português como fonte externa. Caso surja uma integração em outro idioma, o modelo de dados permanecerá consistente.
- **Termos em Português:** Mantive termos específicos como CNPJ e CPF em português, pois são conceitos brasileiros sem traduções exatas e são os termos utilizados na planilha de origem.
- **Streams:** Utilizei streams nos processos de importação e exportação. Essa decisão visa aliviar o uso de memória e CPU do servidor, garantindo escalabilidade e permitindo, futuramente, a implementação de barras de progresso.
- **Arquitetura Enxuta:** Estruturei o projeto seguindo o padrão: Rotas > Controller > Services > Repositories.
    - **Rotas:** Apenas organizam os endpoints e chamam os controladores.
    - **Controller:** Intermedeia os dados entre a rota e o service, sem conter lógica complexa.
    - **Services:** Cada service possui uma única responsabilidade, evitando classes excessivamente grandes.
    - **Repository:** Responsável exclusivamente pela comunicação com o banco de dados.
- **Tipagem e Utilitários:** Usei Interfaces para padronizar as interfaces de entrada e saída. Os utilitários (utils) e validadores ajudam a manter o código limpo (KISS) e evitar repetição (DRY).
- **Testes:** Implementei testes unitários com Jest para cobrir as funções de utilitários e validadores, garantindo a confiabilidade das regras de negócio básicas.
- Configurar o **CORS:** Configurar e testar para aceitar apenas conexões da whitelist

### Validações
- **Documentos:** Implementei validação matemática real para CNPJ e CPF.
- **Campos Obrigatórios:** Tratei a obrigatoriedade diretamente na camada de validação.
- **Integridade:** Os campos de status e tipos de combustível são validados contra enums, garantindo que nenhum dado inconsistente entre no sistema.

### Trade-offs
- **Limite de Erros no Front-end:** Limitei a quantidade de mensagens de erro exibidas simultaneamente para evitar problemas de tráfego de dados. Em contrapartida, exibo a contagem total de erros pendentes para que o usuário tenha uma noção da carga de correções necessária.
- **Rigidez nos Combustíveis:** Ao pré-definir os tipos de combustível aceitos, perco flexibilidade imediata para novos nomes, mas ganho em integridade, padronização e previsibilidade do banco de dados.

### O que faria diferente se tivesse mais tempo
- Adicionaria internacionalização (i18n) às mensagens de erro para padronizar o backend em inglês.
- Implementaria suporte ao novo formato de CNPJ alfanumérico.
- Criaria uma funcionalidade para exportar um relatório de erros em arquivo caso a planilha importada tivesse muitas inconsistências.
- Desenvolveria uma barra de progresso em tempo real para as operações de importação e exportação.
- Adicionaria um resumo detalhado ao final da importação, mostrando exatamente quantos registros foram processados, criados ou ignorados.

---

### Perguntas Frequentes

**Como tratar registros duplicados no CSV?**
Eu trato os registros duplicados diretamente na inserção no banco de dados. Utilizo a cláusula `ON CONFLICT (cnpj) DO NOTHING`. Dessa forma, se o CNPJ já existir, o sistema simplesmente ignora a nova entrada sem interromper o processo de importação.

**Como identificar se um posto já existe?**
Eu utilizo o CNPJ como identificador único (chave primária/única). Durante a importação em lote, não realizo consultas prévias para verificar a existência, pois identifiquei em testes com grandes volumes (500 mil registros) que isso geraria um gargalo de performance. O próprio banco de dados gerencia essa identificação através da restrição de unicidade.

**Como lidar com combustíveis ainda não cadastrados?**
Lido com isso na camada de validação. Se um tipo de combustível presente no CSV não estiver mapeado no meu enum interno, o sistema retorna um erro de validação e fornece esse feedback ao usuário. Minha prioridade é garantir que não existam dados inconsistentes ou "texto livre" em campos que devem ser padronizados.

**Como organizar as tabelas e relacionamentos do banco?**
Desenhei o banco com uma tabela principal para os postos (`gas_stations`) e uma tabela relacionada para os tipos de combustível (`gas_station_fuel_type`), seguindo uma relação 1:N. Escolhi essa estrutura por ser eficiente para o nível de complexidade atual, mantendo o sistema simples e totalmente funcional.

**Como garantir que a exportação continue compatível com a importação?**
Eu garanto a compatibilidade tratando os dados em ambas as pontas. Na importação, limpo e valido campos como CNPJ e CEP. Na exportação, aplico a formatação inversa, garantindo que o arquivo gerado siga exatamente o padrão esperado pelo validador de importação do sistema.

**Como modelou o banco e por quê?**
Modelei o banco para representar cada linha da planilha importada. A tabela `gas_stations` armazena os dados básicos e o endereço. Usei uma relação 1:N para os tipos de combustível e enums para status e tipos, visando a integridade dos dados. Escolhi essa modelagem por ser escalável através de migrations, permitindo futuras expansões sem perder a simplicidade inicial.

**Como tratou importação, validação e duplicidades?**
Tratei a importação utilizando streams para processar os dados de forma eficiente. A validação ocorre em camadas, verificando desde a obrigatoriedade dos campos até a validade matemática de documentos. As duplicidades são resolvidas no nível do banco de dados, priorizando a performance e a unicidade do CNPJ conforme mencionei anteriormente.

**Como pensou a exportação?**
Pensei na exportação como um espelho da importação. Utilizo streams para gerar o arquivo, garantindo baixo consumo de memória, e aplico máscaras de formatação para que os dados exportados sejam legíveis e, ao mesmo tempo, prontos para serem reimportados se necessário.

**Quais trade-offs assumiu?**
Assumi a limitação na exibição de erros para proteger a performance do front-end e a rigidez na validação de campos padronizados (como tipos de combustíveis) para garantir a saúde a longo prazo dos dados, em vez de permitir entradas de texto livre que poderiam sujar o banco.

**O que faria diferente se tivesse mais tempo?**
Eu focaria em melhorar a experiência do usuário, adicionando barras de progresso e relatórios de erros para download. Também expandiria as validações para novos formatos de documentos brasileiros e internacionalizaria as respostas do servidor.

### Sobre o uso de IA

Acredito que o desenvolvedor que não utiliza IA está se tornando obsoleto e perdendo produtividade. A programação muda constantemente e a IA deve ser encarada como uma ferramenta essencial de auxílio, desde que seu uso seja devidamente monitorado e controlado.

Para este projeto, utilizei o JetBrains AI, que é um assistente inteligente integrado diretamente à IDE para otimizar o fluxo de trabalho. Utilizei-o por meio do Junie, que integra múltiplos modelos e tecnologias como Codex, OpenAI, Gemini e Ollama (via MCP). A IA me contribuiu no desenvolvimento de novas funcionalidades e na criação de testes unitários, garantindo que todo o processo fosse acompanhado e validado por mim.
Cada Linha de codigo escrito pela IA foi monitarada, analisada, testada e otmizada por mim para garantir o sucesso da entrega.

Boa semana!
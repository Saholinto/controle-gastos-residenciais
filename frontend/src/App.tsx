import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import './App.css'

const API_URL = 'http://localhost:5288/api'

type TransactionType = 'Income' | 'Expense'

interface Person {
  id: number
  name: string
  age: number
}

interface Transaction {
  id: number
  description: string
  amount: number
  type: TransactionType
  personId: number
  personName: string
}

interface PersonTotals {
  personId: number
  personName: string
  totalIncome: number
  totalExpense: number
  balance: number
}

interface TotalsResponse {
  people: PersonTotals[]
  totalIncome: number
  totalExpense: number
  netBalance: number
}

interface PersonForm {
  name: string
  age: string
}

interface TransactionForm {
  description: string
  amount: string
  type: TransactionType
  personId: string
}

type MessageType = 'success' | 'error'

interface FeedbackMessage {
  type: MessageType
  text: string
}

const initialPersonForm: PersonForm = {
  name: '',
  age: '',
}

const initialTransactionForm: TransactionForm = {
  description: '',
  amount: '',
  type: 'Expense',
  personId: '',
}

function App() {
  const [people, setPeople] = useState<Person[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])

  const [totals, setTotals] = useState<TotalsResponse>({
    people: [],
    totalIncome: 0,
    totalExpense: 0,
    netBalance: 0,
  })

  const [personForm, setPersonForm] =
    useState<PersonForm>(initialPersonForm)

  const [transactionForm, setTransactionForm] =
    useState<TransactionForm>(initialTransactionForm)

  const [loading, setLoading] = useState(true)
  const [submittingPerson, setSubmittingPerson] = useState(false)

  const [submittingTransaction, setSubmittingTransaction] =
    useState(false)

  const [deletingPersonId, setDeletingPersonId] =
    useState<number | null>(null)

  const [message, setMessage] =
    useState<FeedbackMessage | null>(null)

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }),
    [],
  )

  const showMessage = useCallback(
    (type: MessageType, text: string) => {
      setMessage({ type, text })

      window.setTimeout(() => {
        setMessage(null)
      }, 4500)
    },
    [],
  )

  const extractErrorMessage = async (
    response: Response,
    defaultMessage: string,
  ) => {
    try {
      const data = await response.json()

      if (typeof data?.message === 'string') {
        return data.message
      }

      if (data?.errors && typeof data.errors === 'object') {
        const validationMessages = Object.values(data.errors)
          .flat()
          .filter(
            (item): item is string =>
              typeof item === 'string',
          )

        if (validationMessages.length > 0) {
          return validationMessages.join(' ')
        }
      }

      if (typeof data?.title === 'string') {
        return data.title
      }
    } catch {
      // A resposta pode não possuir conteúdo JSON.
    }

    return defaultMessage
  }

  const loadData = useCallback(async () => {
    setLoading(true)

    try {
      const [
        peopleResponse,
        transactionsResponse,
        totalsResponse,
      ] = await Promise.all([
        fetch(`${API_URL}/people`),
        fetch(`${API_URL}/transactions`),
        fetch(`${API_URL}/totals`),
      ])

      if (
        !peopleResponse.ok ||
        !transactionsResponse.ok ||
        !totalsResponse.ok
      ) {
        throw new Error(
          'Não foi possível carregar os dados da aplicação.',
        )
      }

      const peopleData: Person[] =
        await peopleResponse.json()

      const transactionsData: Transaction[] =
        await transactionsResponse.json()

      const totalsData: TotalsResponse =
        await totalsResponse.json()

      setPeople(peopleData)
      setTransactions(transactionsData)
      setTotals(totalsData)

      setTransactionForm((currentForm) => {
        const selectedPersonStillExists = peopleData.some(
          (person) =>
            person.id.toString() === currentForm.personId,
        )

        return {
          ...currentForm,
          personId: selectedPersonStillExists
            ? currentForm.personId
            : peopleData[0]?.id.toString() ?? '',
        }
      })
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : 'Erro ao conectar com o backend.'

      showMessage('error', errorMessage)
    } finally {
      setLoading(false)
    }
  }, [showMessage])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const handlePersonSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    const name = personForm.name.trim()
    const age = Number(personForm.age)

    if (!name) {
      showMessage('error', 'Informe o nome da pessoa.')
      return
    }

    if (!Number.isInteger(age) || age < 0 || age > 130) {
      showMessage(
        'error',
        'Informe uma idade válida entre 0 e 130 anos.',
      )
      return
    }

    setSubmittingPerson(true)

    try {
      const response = await fetch(`${API_URL}/people`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          age,
        }),
      })

      if (!response.ok) {
        const errorMessage = await extractErrorMessage(
          response,
          'Não foi possível cadastrar a pessoa.',
        )

        throw new Error(errorMessage)
      }

      setPersonForm(initialPersonForm)

      showMessage(
        'success',
        'Pessoa cadastrada com sucesso.',
      )

      await loadData()
    } catch (error) {
      showMessage(
        'error',
        error instanceof Error
          ? error.message
          : 'Erro ao cadastrar a pessoa.',
      )
    } finally {
      setSubmittingPerson(false)
    }
  }

  const handleTransactionSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()

    const description =
      transactionForm.description.trim()

    const normalizedAmount =
      transactionForm.amount.replace(',', '.')

    const amount = Number(normalizedAmount)
    const personId = Number(transactionForm.personId)

    if (!description) {
      showMessage(
        'error',
        'Informe a descrição da transação.',
      )
      return
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      showMessage(
        'error',
        'O valor deve ser maior que zero.',
      )
      return
    }

    if (!Number.isInteger(personId) || personId <= 0) {
      showMessage('error', 'Selecione uma pessoa.')
      return
    }

    setSubmittingTransaction(true)

    try {
      const response = await fetch(
        `${API_URL}/transactions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            description,
            amount,
            type: transactionForm.type,
            personId,
          }),
        },
      )

      if (!response.ok) {
        const errorMessage = await extractErrorMessage(
          response,
          'Não foi possível cadastrar a transação.',
        )

        throw new Error(errorMessage)
      }

      setTransactionForm((currentForm) => ({
        ...initialTransactionForm,
        personId: currentForm.personId,
      }))

      showMessage(
        'success',
        'Transação cadastrada com sucesso.',
      )

      await loadData()
    } catch (error) {
      showMessage(
        'error',
        error instanceof Error
          ? error.message
          : 'Erro ao cadastrar a transação.',
      )
    } finally {
      setSubmittingTransaction(false)
    }
  }

  const handleDeletePerson = async (
    person: Person,
  ) => {
    const confirmed = window.confirm(
      `Deseja excluir ${person.name}?\n\nTodas as transações dessa pessoa também serão apagadas.`,
    )

    if (!confirmed) {
      return
    }

    setDeletingPersonId(person.id)

    try {
      const response = await fetch(
        `${API_URL}/people/${person.id}`,
        {
          method: 'DELETE',
        },
      )

      if (!response.ok) {
        const errorMessage = await extractErrorMessage(
          response,
          'Não foi possível excluir a pessoa.',
        )

        throw new Error(errorMessage)
      }

      showMessage(
        'success',
        'Pessoa e suas transações foram excluídas com sucesso.',
      )

      await loadData()
    } catch (error) {
      showMessage(
        'error',
        error instanceof Error
          ? error.message
          : 'Erro ao excluir a pessoa.',
      )
    } finally {
      setDeletingPersonId(null)
    }
  }

  const getInitials = (name: string) => {
    const words = name
      .trim()
      .split(/\s+/)
      .filter(Boolean)

    if (words.length === 0) {
      return '?'
    }

    if (words.length === 1) {
      return words[0].slice(0, 2).toUpperCase()
    }

    return `${words[0][0]}${
      words[words.length - 1][0]
    }`.toUpperCase()
  }

  const findPersonTotals = (personId: number) =>
    totals.people.find(
      (personTotal) =>
        personTotal.personId === personId,
    )

  return (
    <main className="app-shell">
      <section className="app-container">
        <header className="app-header">
          <div>
            <span className="eyebrow">
              Financeiro familiar
            </span>

            <h1>
              Controle de Gastos Residenciais
            </h1>

            <p className="subtitle">
              Cadastre moradores, registre receitas e
              despesas e acompanhe os resultados financeiros
              de cada pessoa e da residência.
            </p>
          </div>

          <button
            className="secondary-button"
            type="button"
            onClick={() => void loadData()}
            disabled={loading}
          >
            {loading
              ? 'Atualizando...'
              : 'Atualizar dados'}
          </button>
        </header>

        {message && (
          <div
            className={`message message-${message.type}`}
            role="alert"
          >
            {message.text}
          </div>
        )}

        <section
          className="summary-grid"
          aria-label="Totais gerais"
        >
          <article className="summary-card income-card">
            <span>Receitas gerais</span>

            <strong>
              {currencyFormatter.format(
                totals.totalIncome,
              )}
            </strong>
          </article>

          <article className="summary-card expense-card">
            <span>Despesas gerais</span>

            <strong>
              {currencyFormatter.format(
                totals.totalExpense,
              )}
            </strong>
          </article>

          <article className="summary-card balance-card">
            <span>Saldo líquido</span>

            <strong>
              {currencyFormatter.format(
                totals.netBalance,
              )}
            </strong>
          </article>
        </section>

        <section className="forms-grid">
          <article className="panel">
            <span className="section-label">
              Moradores
            </span>

            <h2>Cadastrar pessoa</h2>

            <form onSubmit={handlePersonSubmit}>
              <label htmlFor="person-name">
                Nome
              </label>

              <input
                id="person-name"
                type="text"
                placeholder="Ex.: Maria Silva"
                value={personForm.name}
                maxLength={100}
                onChange={(event) =>
                  setPersonForm((currentForm) => ({
                    ...currentForm,
                    name: event.target.value,
                  }))
                }
              />

              <label htmlFor="person-age">
                Idade
              </label>

              <input
                id="person-age"
                type="number"
                placeholder="Ex.: 30"
                min={0}
                max={130}
                value={personForm.age}
                onChange={(event) =>
                  setPersonForm((currentForm) => ({
                    ...currentForm,
                    age: event.target.value,
                  }))
                }
              />

              <button
                className="primary-button"
                type="submit"
                disabled={submittingPerson}
              >
                {submittingPerson
                  ? 'Cadastrando...'
                  : 'Cadastrar pessoa'}
              </button>
            </form>
          </article>

          <article className="panel">
            <span className="section-label">
              Movimentações
            </span>

            <h2>Cadastrar transação</h2>

            <form
              onSubmit={handleTransactionSubmit}
            >
              <label htmlFor="transaction-description">
                Descrição
              </label>

              <input
                id="transaction-description"
                type="text"
                placeholder="Ex.: Mercado"
                value={transactionForm.description}
                onChange={(event) =>
                  setTransactionForm(
                    (currentForm) => ({
                      ...currentForm,
                      description:
                        event.target.value,
                    }),
                  )
                }
              />

              <div className="form-row">
                <div>
                  <label htmlFor="transaction-amount">
                    Valor
                  </label>

                  <input
                    id="transaction-amount"
                    type="number"
                    placeholder="0,00"
                    min="0.01"
                    step="0.01"
                    value={transactionForm.amount}
                    onChange={(event) =>
                      setTransactionForm(
                        (currentForm) => ({
                          ...currentForm,
                          amount:
                            event.target.value,
                        }),
                      )
                    }
                  />
                </div>

                <div>
                  <label htmlFor="transaction-type">
                    Tipo
                  </label>

                  <select
                    id="transaction-type"
                    value={transactionForm.type}
                    onChange={(event) =>
                      setTransactionForm(
                        (currentForm) => ({
                          ...currentForm,
                          type: event.target
                            .value as TransactionType,
                        }),
                      )
                    }
                  >
                    <option value="Expense">
                      Despesa
                    </option>

                    <option value="Income">
                      Receita
                    </option>
                  </select>
                </div>
              </div>

              <label htmlFor="transaction-person">
                Pessoa
              </label>

              <select
                id="transaction-person"
                value={transactionForm.personId}
                disabled={people.length === 0}
                onChange={(event) =>
                  setTransactionForm(
                    (currentForm) => ({
                      ...currentForm,
                      personId:
                        event.target.value,
                    }),
                  )
                }
              >
                {people.length === 0 ? (
                  <option value="">
                    Cadastre uma pessoa primeiro
                  </option>
                ) : (
                  people.map((person) => (
                    <option
                      key={person.id}
                      value={person.id}
                    >
                      {person.name} — {person.age}{' '}
                      anos
                    </option>
                  ))
                )}
              </select>

              <button
                className="primary-button"
                type="submit"
                disabled={
                  submittingTransaction ||
                  loading ||
                  people.length === 0
                }
              >
                {submittingTransaction
                  ? 'Cadastrando...'
                  : 'Cadastrar transação'}
              </button>
            </form>
          </article>
        </section>

        <section className="panel history-panel">
          <div className="section-heading">
            <div>
              <span className="section-label">
                Histórico
              </span>

              <h2>Transações</h2>
            </div>

            <span className="count-badge">
              {transactions.length}
            </span>
          </div>

          {loading ? (
            <p className="empty-state">
              Carregando transações...
            </p>
          ) : transactions.length === 0 ? (
            <p className="empty-state">
              Nenhuma transação cadastrada.
            </p>
          ) : (
            <div className="transactions-grid">
              {transactions.map((transaction) => {
                const isIncome =
                  transaction.type === 'Income'

                return (
                  <article
                    className="transaction-card"
                    key={transaction.id}
                  >
                    <span
                      className={`transaction-icon ${
                        isIncome
                          ? 'income-icon'
                          : 'expense-icon'
                      }`}
                      aria-hidden="true"
                    >
                      {isIncome ? '↑' : '↓'}
                    </span>

                    <div className="transaction-main">
                      <strong>
                        {transaction.description}
                      </strong>

                      <small>
                        {transaction.personName}
                      </small>
                    </div>

                    <strong
                      className={
                        isIncome
                          ? 'positive-value'
                          : 'negative-value'
                      }
                    >
                      {isIncome ? '+' : '-'}{' '}
                      {currencyFormatter.format(
                        transaction.amount,
                      )}
                    </strong>
                  </article>
                )
              })}
            </div>
          )}
        </section>

        <section className="panel totals-panel">
          <div className="section-heading">
            <div>
              <span className="section-label">
                Consulta de totais
              </span>

              <h2>Totais por pessoa</h2>
            </div>

            <span className="count-badge">
              {totals.people.length}
            </span>
          </div>

          {loading ? (
            <p className="empty-state">
              Calculando totais...
            </p>
          ) : totals.people.length === 0 ? (
            <p className="empty-state">
              Cadastre pessoas para visualizar os
              totais individuais.
            </p>
          ) : (
            <>
              <div className="person-totals-grid">
                {totals.people.map(
                  (personTotal) => (
                    <article
                      className="person-total-card"
                      key={personTotal.personId}
                    >
                      <div className="person-total-header">
                        <span
                          className="avatar notranslate"
                          translate="no"
                        >
                          {getInitials(
                            personTotal.personName,
                          )}
                        </span>

                        <div>
                          <strong>
                            {personTotal.personName}
                          </strong>

                          <small>
                            Pessoa #
                            {personTotal.personId}
                          </small>
                        </div>
                      </div>

                      <div className="person-values">
                        <div>
                          <span>Receitas</span>

                          <strong className="positive-value">
                            {currencyFormatter.format(
                              personTotal.totalIncome,
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>Despesas</span>

                          <strong className="negative-value">
                            {currencyFormatter.format(
                              personTotal.totalExpense,
                            )}
                          </strong>
                        </div>

                        <div>
                          <span>Saldo</span>

                          <strong
                            className={
                              personTotal.balance >= 0
                                ? 'positive-value'
                                : 'negative-value'
                            }
                          >
                            {currencyFormatter.format(
                              personTotal.balance,
                            )}
                          </strong>
                        </div>
                      </div>
                    </article>
                  ),
                )}
              </div>

              <article className="general-total-card">
                <div>
                  <span>
                    Total geral de receitas
                  </span>

                  <strong className="positive-value">
                    {currencyFormatter.format(
                      totals.totalIncome,
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Total geral de despesas
                  </span>

                  <strong className="negative-value">
                    {currencyFormatter.format(
                      totals.totalExpense,
                    )}
                  </strong>
                </div>

                <div>
                  <span>
                    Saldo líquido geral
                  </span>

                  <strong
                    className={
                      totals.netBalance >= 0
                        ? 'positive-value'
                        : 'negative-value'
                    }
                  >
                    {currencyFormatter.format(
                      totals.netBalance,
                    )}
                  </strong>
                </div>
              </article>
            </>
          )}
        </section>

        <section className="panel people-panel">
          <div className="section-heading">
            <div>
              <span className="section-label">
                Pessoas cadastradas
              </span>

              <h2>{people.length} pessoa(s)</h2>
            </div>

            <span className="count-badge">
              {people.length}
            </span>
          </div>

          {loading ? (
            <p className="empty-state">
              Carregando pessoas...
            </p>
          ) : people.length === 0 ? (
            <p className="empty-state">
              Nenhuma pessoa cadastrada.
            </p>
          ) : (
            <div className="people-grid">
              {people.map((person) => {
                const personTotal =
                  findPersonTotals(person.id)

                return (
                  <article
                    className="person-card"
                    key={person.id}
                  >
                    <span
                      className="avatar notranslate"
                      translate="no"
                    >
                      {getInitials(person.name)}
                    </span>

                    <div className="person-info">
                      <strong>
                        {person.name}
                      </strong>

                      <small>
                        {person.age} anos
                      </small>

                      {personTotal && (
                        <span className="person-balance">
                          Saldo:{' '}
                          <strong
                            className={
                              personTotal.balance >= 0
                                ? 'positive-value'
                                : 'negative-value'
                            }
                          >
                            {currencyFormatter.format(
                              personTotal.balance,
                            )}
                          </strong>
                        </span>
                      )}
                    </div>

                    <button
                      className="delete-button"
                      type="button"
                      disabled={
                        deletingPersonId === person.id
                      }
                      onClick={() =>
                        void handleDeletePerson(
                          person,
                        )
                      }
                    >
                      {deletingPersonId === person.id
                        ? 'Excluindo...'
                        : 'Excluir'}
                    </button>
                  </article>
                )
              })}
            </div>
          )}
        </section>
      </section>
    </main>
  )
}

export default App
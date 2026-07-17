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

async function readErrorMessage(
  response: Response,
  defaultMessage: string,
) {
  try {
    const data = await response.json()

    if (typeof data?.message === 'string') {
      return data.message
    }

    if (data?.errors && typeof data.errors === 'object') {
      const messages = Object.values(data.errors)
        .flatMap((value) =>
          Array.isArray(value) ? value : [String(value)],
        )
        .filter(Boolean)

      if (messages.length > 0) {
        return messages.join(' ')
      }
    }

    if (typeof data?.title === 'string') {
      return data.title
    }
  } catch {
    // A resposta pode estar vazia ou não estar no formato JSON.
  }

  return defaultMessage
}

function App() {
  const [people, setPeople] = useState<Person[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>(
    [],
  )

  const [personForm, setPersonForm] = useState<PersonForm>({
    name: '',
    age: '',
  })

  const [transactionForm, setTransactionForm] =
    useState<TransactionForm>({
      description: '',
      amount: '',
      type: 'Expense',
      personId: '',
    })

  const [isLoading, setIsLoading] = useState(true)
  const [isSavingPerson, setIsSavingPerson] = useState(false)

  const [isSavingTransaction, setIsSavingTransaction] =
    useState(false)

  const [deletingPersonId, setDeletingPersonId] = useState<
    number | null
  >(null)

  const [successMessage, setSuccessMessage] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const clearMessages = () => {
    setSuccessMessage('')
    setErrorMessage('')
  }

  const loadData = useCallback(async () => {
    setIsLoading(true)
    setErrorMessage('')

    try {
      const [peopleResponse, transactionsResponse] =
        await Promise.all([
          fetch(`${API_URL}/people`),
          fetch(`${API_URL}/transactions`),
        ])

      if (!peopleResponse.ok) {
        throw new Error(
          await readErrorMessage(
            peopleResponse,
            'Não foi possível carregar as pessoas.',
          ),
        )
      }

      if (!transactionsResponse.ok) {
        throw new Error(
          await readErrorMessage(
            transactionsResponse,
            'Não foi possível carregar as transações.',
          ),
        )
      }

      const peopleData: Person[] = await peopleResponse.json()

      const transactionsData: Transaction[] =
        await transactionsResponse.json()

      setPeople(peopleData)
      setTransactions(transactionsData)

      setTransactionForm((currentForm) => {
        const selectedPersonStillExists = peopleData.some(
          (person) =>
            person.id === Number(currentForm.personId),
        )

        if (selectedPersonStillExists) {
          return currentForm
        }

        return {
          ...currentForm,
          personId:
            peopleData.length > 0
              ? String(peopleData[0].id)
              : '',
        }
      })
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro ao conectar com o backend.'

      setErrorMessage(
        `${message} Confirme se a API está rodando na porta 5288.`,
      )
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const totals = useMemo(() => {
    const income = transactions
      .filter((transaction) => transaction.type === 'Income')
      .reduce(
        (total, transaction) => total + transaction.amount,
        0,
      )

    const expense = transactions
      .filter((transaction) => transaction.type === 'Expense')
      .reduce(
        (total, transaction) => total + transaction.amount,
        0,
      )

    return {
      income,
      expense,
      balance: income - expense,
    }
  }, [transactions])

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(value)

  const getInitials = (name: string) => {
    const words = name.trim().split(/\s+/).filter(Boolean)

    if (words.length === 0) {
      return '?'
    }

    if (words.length === 1) {
      return words[0].charAt(0).toUpperCase()
    }

    return `${words[0].charAt(0)}${words[
      words.length - 1
    ].charAt(0)}`.toUpperCase()
  }

  const handleCreatePerson = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()
    clearMessages()

    const name = personForm.name.trim()
    const age = Number(personForm.age)

    if (!name) {
      setErrorMessage('Digite o nome da pessoa.')
      return
    }

    if (
      personForm.age.trim() === '' ||
      !Number.isInteger(age) ||
      age < 0 ||
      age > 130
    ) {
      setErrorMessage(
        'Digite uma idade inteira entre 0 e 130 anos.',
      )
      return
    }

    setIsSavingPerson(true)

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
        throw new Error(
          await readErrorMessage(
            response,
            'Não foi possível cadastrar a pessoa.',
          ),
        )
      }

      setPersonForm({
        name: '',
        age: '',
      })

      setSuccessMessage('Pessoa cadastrada com sucesso.')

      await loadData()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível cadastrar a pessoa.',
      )
    } finally {
      setIsSavingPerson(false)
    }
  }

  const handleCreateTransaction = async (
    event: FormEvent<HTMLFormElement>,
  ) => {
    event.preventDefault()
    clearMessages()

    const description = transactionForm.description.trim()

    const normalizedAmount = transactionForm.amount
      .replace(/\./g, '')
      .replace(',', '.')

    const amount = Number(normalizedAmount)
    const personId = Number(transactionForm.personId)

    if (!description) {
      setErrorMessage('Digite a descrição da transação.')
      return
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      setErrorMessage('O valor deve ser maior que zero.')
      return
    }

    if (!personId) {
      setErrorMessage('Selecione uma pessoa.')
      return
    }

    setIsSavingTransaction(true)

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
        throw new Error(
          await readErrorMessage(
            response,
            'Não foi possível cadastrar a transação.',
          ),
        )
      }

      setTransactionForm((currentForm) => ({
        description: '',
        amount: '',
        type: 'Expense',
        personId: currentForm.personId,
      }))

      setSuccessMessage('Transação cadastrada com sucesso.')

      await loadData()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível cadastrar a transação.',
      )
    } finally {
      setIsSavingTransaction(false)
    }
  }

  const handleDeletePerson = async (person: Person) => {
    const confirmed = window.confirm(
      `Deseja realmente excluir ${person.name}?`,
    )

    if (!confirmed) {
      return
    }

    clearMessages()
    setDeletingPersonId(person.id)

    try {
      const response = await fetch(
        `${API_URL}/people/${person.id}`,
        {
          method: 'DELETE',
        },
      )

      if (!response.ok) {
        throw new Error(
          await readErrorMessage(
            response,
            'Não foi possível excluir a pessoa.',
          ),
        )
      }

      setSuccessMessage('Pessoa excluída com sucesso.')

      await loadData()
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : 'Não foi possível excluir a pessoa.',
      )
    } finally {
      setDeletingPersonId(null)
    }
  }

  return (
    <main className="page-container">
      <header className="page-header">
        <div>
          <span className="eyebrow">
            Financeiro familiar
          </span>

          <h1>Controle de Gastos Residenciais</h1>

          <p>
            Cadastre moradores, registre receitas e despesas e
            acompanhe o saldo da residência.
          </p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={() => void loadData()}
          disabled={isLoading}
        >
          {isLoading ? 'Atualizando...' : 'Atualizar dados'}
        </button>
      </header>

      {successMessage && (
        <div className="alert success-alert">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="alert error-alert">
          {errorMessage}
        </div>
      )}

      <section className="summary-grid">
        <article className="summary-card income-card">
          <span>Receitas</span>
          <strong>{formatCurrency(totals.income)}</strong>
        </article>

        <article className="summary-card expense-card">
          <span>Despesas</span>
          <strong>{formatCurrency(totals.expense)}</strong>
        </article>

        <article className="summary-card balance-card">
          <span>Saldo</span>
          <strong>{formatCurrency(totals.balance)}</strong>
        </article>
      </section>

      <section className="forms-grid">
        <article className="content-card">
          <div className="card-heading">
            <div>
              <span className="card-label">Moradores</span>
              <h2>Cadastrar pessoa</h2>
            </div>
          </div>

          <form
            className="form"
            onSubmit={handleCreatePerson}
          >
            <label>
              Nome

              <input
                type="text"
                value={personForm.name}
                placeholder="Ex.: Maria Silva"
                maxLength={100}
                onChange={(event) =>
                  setPersonForm((currentForm) => ({
                    ...currentForm,
                    name: event.target.value,
                  }))
                }
              />
            </label>

            <label>
              Idade

              <input
                type="number"
                value={personForm.age}
                placeholder="Ex.: 30"
                min={0}
                max={130}
                onChange={(event) =>
                  setPersonForm((currentForm) => ({
                    ...currentForm,
                    age: event.target.value,
                  }))
                }
              />
            </label>

            <button
              type="submit"
              className="primary-button"
              disabled={isSavingPerson}
            >
              {isSavingPerson
                ? 'Cadastrando...'
                : 'Cadastrar pessoa'}
            </button>
          </form>
        </article>

        <article className="content-card">
          <div className="card-heading">
            <div>
              <span className="card-label">
                Movimentações
              </span>

              <h2>Cadastrar transação</h2>
            </div>
          </div>

          <form
            className="form"
            onSubmit={handleCreateTransaction}
          >
            <label>
              Descrição

              <input
                type="text"
                value={transactionForm.description}
                placeholder="Ex.: Mercado"
                maxLength={150}
                onChange={(event) =>
                  setTransactionForm((currentForm) => ({
                    ...currentForm,
                    description: event.target.value,
                  }))
                }
              />
            </label>

            <div className="form-row">
              <label>
                Valor

                <input
                  type="text"
                  inputMode="decimal"
                  value={transactionForm.amount}
                  placeholder="0,00"
                  onChange={(event) =>
                    setTransactionForm((currentForm) => ({
                      ...currentForm,
                      amount: event.target.value,
                    }))
                  }
                />
              </label>

              <label>
                Tipo

                <select
                  value={transactionForm.type}
                  onChange={(event) =>
                    setTransactionForm((currentForm) => ({
                      ...currentForm,
                      type: event.target
                        .value as TransactionType,
                    }))
                  }
                >
                  <option value="Expense">Despesa</option>
                  <option value="Income">Receita</option>
                </select>
              </label>
            </div>

            <label>
              Pessoa

              <select
                value={transactionForm.personId}
                disabled={people.length === 0}
                onChange={(event) =>
                  setTransactionForm((currentForm) => ({
                    ...currentForm,
                    personId: event.target.value,
                  }))
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
                      {person.name} — {person.age} anos
                    </option>
                  ))
                )}
              </select>
            </label>

            <button
              type="submit"
              className="primary-button"
              disabled={
                isSavingTransaction || people.length === 0
              }
            >
              {isSavingTransaction
                ? 'Cadastrando...'
                : 'Cadastrar transação'}
            </button>
          </form>
        </article>
      </section>

      <section className="data-section">
        <article className="content-card">
          <div className="card-heading">
            <div>
              <span className="card-label">Histórico</span>
              <h2>Transações</h2>
            </div>

            <span className="count-badge">
              {transactions.length}
            </span>
          </div>

          {transactions.length === 0 ? (
            <p className="empty-message">
              Nenhuma transação cadastrada.
            </p>
          ) : (
            <div className="transactions-list">
              {transactions.map((transaction) => {
                const isIncome =
                  transaction.type === 'Income'

                return (
                  <div
                    className="transaction-item"
                    key={transaction.id}
                  >
                    <div
                      className={`transaction-icon ${
                        isIncome
                          ? 'income-icon'
                          : 'expense-icon'
                      }`}
                      translate="no"
                    >
                      {isIncome ? '↑' : '↓'}
                    </div>

                    <div className="transaction-info">
                      <strong>
                        {transaction.description}
                      </strong>

                      <span>{transaction.personName}</span>
                    </div>

                    <strong
                      className={`transaction-value ${
                        isIncome
                          ? 'income-value'
                          : 'expense-value'
                      }`}
                    >
                      {isIncome ? '+' : '-'}{' '}
                      {formatCurrency(transaction.amount)}
                    </strong>
                  </div>
                )
              })}
            </div>
          )}
        </article>

        <article className="content-card">
          <div className="card-heading">
            <div>
              <span className="card-label">
                Pessoas cadastradas
              </span>

              <h2>
                {people.length}{' '}
                {people.length === 1
                  ? 'pessoa'
                  : 'pessoas'}
              </h2>
            </div>

            <span className="count-badge">
              {people.length}
            </span>
          </div>

          {people.length === 0 ? (
            <p className="empty-message">
              Nenhuma pessoa cadastrada.
            </p>
          ) : (
            <div className="people-list">
              {people.map((person) => (
                <div
                  className="person-item"
                  key={person.id}
                >
                  <div
                    className="person-avatar notranslate"
                    translate="no"
                  >
                    {getInitials(person.name)}
                  </div>

                  <div className="person-info">
                    <strong>{person.name}</strong>
                    <span>{person.age} anos</span>
                  </div>

                  <button
                    type="button"
                    className="delete-button"
                    disabled={deletingPersonId === person.id}
                    onClick={() =>
                      void handleDeletePerson(person)
                    }
                  >
                    {deletingPersonId === person.id
                      ? 'Excluindo...'
                      : 'Excluir'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </article>
      </section>
    </main>
  )
}

export default App
using ControleGastos.Api.Data;
using ControleGastos.Api.DTOs.Transactions;
using ControleGastos.Api.Enums;
using ControleGastos.Api.Models;
using Microsoft.EntityFrameworkCore;

namespace ControleGastos.Api.Services;

/// <summary>
/// Contém as regras e operações relacionadas às transações.
/// </summary>
public class TransactionService
{
    private readonly AppDbContext _context;

    public TransactionService(AppDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Lista todas as transações cadastradas, da mais recente para a mais antiga.
    /// </summary>
    public async Task<IReadOnlyList<TransactionResponse>> GetAllAsync()
    {
        return await _context.Transactions
            .AsNoTracking()
            .OrderByDescending(transaction => transaction.Id)
            .Select(transaction => new TransactionResponse(
                transaction.Id,
                transaction.Description,
                transaction.Amount,
                transaction.Type,
                transaction.PersonId,
                transaction.Person.Name))
            .ToListAsync();
    }

    /// <summary>
    /// Cadastra uma nova transação, validando a pessoa e as regras de idade.
    /// </summary>
    public async Task<(TransactionResponse? Transaction, string? Error)>
        CreateAsync(CreateTransactionRequest request)
    {
        var person = await _context.People
            .FirstOrDefaultAsync(person => person.Id == request.PersonId);

        if (person is null)
        {
            return (null, "Pessoa não encontrada.");
        }

        if (person.Age < 18 && request.Type == TransactionType.Income)
        {
            return (
                null,
                "Pessoas menores de 18 anos só podem possuir despesas.");
        }

        var transaction = new FinancialTransaction
        {
            Description = request.Description.Trim(),
            Amount = request.Amount,
            Type = request.Type,
            PersonId = request.PersonId
        };

        _context.Transactions.Add(transaction);
        await _context.SaveChangesAsync();

        var response = new TransactionResponse(
            transaction.Id,
            transaction.Description,
            transaction.Amount,
            transaction.Type,
            person.Id,
            person.Name);

        return (response, null);
    }
}
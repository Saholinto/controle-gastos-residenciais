using ControleGastos.Api.Enums;

namespace ControleGastos.Api.DTOs.Transactions;

/// <summary>
/// Representa uma transação devolvida pela API.
/// </summary>
public record TransactionResponse(
    int Id,
    string Description,
    decimal Amount,
    TransactionType Type,
    int PersonId,
    string PersonName);
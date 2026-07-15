using System.ComponentModel.DataAnnotations;
using ControleGastos.Api.Enums;

namespace ControleGastos.Api.Models;

/// <summary>
/// Representa uma receita ou despesa associada a uma pessoa.
/// </summary>
public class FinancialTransaction
{
    public int Id { get; set; }

    [Required]
    [MaxLength(200)]
    public string Description { get; set; } = string.Empty;

    public decimal Amount { get; set; }

    public TransactionType Type { get; set; }

    public int PersonId { get; set; }

    public Person Person { get; set; } = null!;
}
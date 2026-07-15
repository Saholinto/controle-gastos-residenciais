using System.ComponentModel.DataAnnotations;

namespace ControleGastos.Api.Models;

/// <summary>
/// Representa uma pessoa cadastrada no sistema.
/// </summary>
public class Person
{
    public int Id { get; set; }

    [Required]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Range(0, 130)]
    public int Age { get; set; }

    public ICollection<FinancialTransaction> Transactions { get; set; }
        = new List<FinancialTransaction>();
}
<?php

declare(strict_types=1);

namespace Application\Model;

use Application\Traits\HasName;
use Application\Traits\HasRemarks;
use Cake\Chronos\Chronos;
use Doctrine\ORM\Mapping as ORM;
use GraphQL\Doctrine\Annotation as API;
use Money\Money;

/**
 * A single line of accounting transaction
 *
 * @ORM\Entity(repositoryClass="Application\Repository\TransactionLineRepository")
 * @API\Filters({
 *     @API\Filter(field="custom", operator="Application\Api\Input\Operator\TransactionWithDocumentOperatorType", type="boolean"),
 *     @API\Filter(field="custom", operator="Application\Api\Input\Operator\TransactionExportOperatorType", type="boolean"),
 * })
 */
class TransactionLine extends AbstractModel
{
    use HasName;
    use HasRemarks;

    /**
     * @var Transaction
     *
     * @ORM\ManyToOne(targetEntity="Transaction", inversedBy="transactionLines")
     * @ORM\JoinColumns({
     *     @ORM\JoinColumn(nullable=false, onDelete="RESTRICT")
     * })
     */
    private $transaction;

    /**
     * @var null|Account
     *
     * @ORM\ManyToOne(targetEntity="Account", inversedBy="debitTransactionLines")
     * @ORM\JoinColumns({
     *     @ORM\JoinColumn(nullable=true, onDelete="RESTRICT")
     * })
     */
    private $debit;

    /**
     * @var null|Account
     *
     * @ORM\ManyToOne(targetEntity="Account", inversedBy="creditTransactionLines")
     * @ORM\JoinColumns({
     *     @ORM\JoinColumn(nullable=true, onDelete="RESTRICT")
     * })
     */
    private $credit;

    /**
     * @var null|Bookable
     *
     * @ORM\ManyToOne(targetEntity="Bookable")
     * @ORM\JoinColumns({
     *     @ORM\JoinColumn(nullable=true, onDelete="SET NULL")
     * })
     */
    private $bookable;

    /**
     * @var Money
     *
     * @ORM\Column(type="Money", options={"unsigned" = true})
     */
    private $balance;

    /**
     * @var Chronos
     * @ORM\Column(type="datetime")
     */
    private $transactionDate;

    /**
     * @var null|TransactionTag
     *
     * @ORM\ManyToOne(targetEntity="TransactionTag")
     * @ORM\JoinColumns({
     *     @ORM\JoinColumn(nullable=true, onDelete="SET NULL")
     * })
     */
    private $transactionTag;

    /**
     * @var bool
     *
     * @ORM\Column(type="boolean", options={"default" = 0})
     */
    private $isReconciled = false;

    /**
     * This store the value of CAMT 054 `<AcctSvcrRef>` element that should
     * hopefully be a universally unique transaction identifier.
     *
     * An absence of value means the line was not imported.
     *
     * @var null|string
     * @ORM\Column(type="string", length=35, nullable=true, unique=true)
     */
    private $importedId;

    /**
     * Set importedId
     *
     * @API\Exclude
     *
     * @param string $importedId
     */
    public function setImportedId(string $importedId): void
    {
        $this->importedId = $importedId;
    }

    /**
     * Get importedId
     *
     * @return null|string
     */
    public function getImportedId(): ?string
    {
        return $this->importedId;
    }

    /**
     * @API\Exclude
     *
     * @param Transaction $transaction
     */
    public function setTransaction(Transaction $transaction): void
    {
        if ($this->transaction) {
            $this->transaction->transactionLineRemoved($this);
        }

        $this->transaction = $transaction;
        $transaction->transactionLineAdded($this);
    }

    /**
     * @return Transaction
     */
    public function getTransaction(): Transaction
    {
        return $this->transaction;
    }

    /**
     * Set debit account
     *
     * @param null|Account $account
     */
    public function setDebit(?Account $account): void
    {
        if ($this->debit) {
            $this->debit->debitTransactionLineRemoved($this);
        }

        $this->debit = $account;

        if ($this->debit) {
            $this->debit->debitTransactionLineAdded($this);
        }
    }

    /**
     * Get debit account
     *
     * @return null|Account
     */
    public function getDebit(): ?Account
    {
        return $this->debit;
    }

    /**
     * Set credit account
     *
     * @param null|Account $account
     */
    public function setCredit(?Account $account): void
    {
        if ($this->credit) {
            $this->credit->creditTransactionLineRemoved($this);
        }

        $this->credit = $account;

        if ($this->credit) {
            $this->credit->creditTransactionLineAdded($this);
        }
    }

    /**
     * Get credit account
     *
     * @return null|Account
     */
    public function getCredit(): ?Account
    {
        return $this->credit;
    }

    /**
     * Get related equipment or service
     *
     * @return null|Bookable
     */
    public function getBookable(): ?Bookable
    {
        return $this->bookable;
    }

    /**
     * Set related equipment or service
     *
     * @param null|Bookable $bookable
     */
    public function setBookable(?Bookable $bookable): void
    {
        $this->bookable = $bookable;
    }

    /**
     * Set balance
     *
     * @param Money $balance
     */
    public function setBalance(Money $balance): void
    {
        $this->balance = $balance;
    }

    /**
     * @return Money
     */
    public function getBalance(): Money
    {
        return $this->balance;
    }

    /**
     * Set date of transaction
     *
     * @param Chronos $transactionDate
     */
    public function setTransactionDate(Chronos $transactionDate): void
    {
        $this->transactionDate = $transactionDate;
    }

    /**
     * Get date of transaction
     *
     * @return Chronos
     */
    public function getTransactionDate(): Chronos
    {
        return $this->transactionDate;
    }

    /**
     * Set transaction tag
     *
     * @param null|TransactionTag $transactionTag
     */
    public function setTransactionTag(?TransactionTag $transactionTag): void
    {
        $this->transactionTag = $transactionTag;
    }

    /**
     * Get transaction tag
     *
     * @return null|TransactionTag
     */
    public function getTransactionTag(): ?TransactionTag
    {
        return $this->transactionTag;
    }

    /**
     * Whether this line of transaction was reconciled (e.g. from a bank statement)
     *
     * @return bool
     */
    public function isReconciled(): bool
    {
        return $this->isReconciled;
    }

    /**
     * Whether this line of transaction was reconciled (e.g. from a bank statement)
     *
     * @param bool $isReconciled
     */
    public function setIsReconciled(bool $isReconciled): void
    {
        $this->isReconciled = $isReconciled;
    }
}

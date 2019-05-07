<?php

declare(strict_types=1);

namespace Application\Service;

use Exception;

/**
 * Class to generate BVR reference number and encoding lines.
 *
 * Typically usage would one of the following:
 *
 * ```php
 * <?php
 *
 * // Provided by your bank
 * $bankAccount = '800876';
 * $postAccount = '01-3456-0';
 *
 * // Your own custom ID to uniquely identify the payment
 * $myId = (string) $user->getId();
 *
 * $referenceNumberToCopyPasteInEBanking = Bvr::getReferenceNumber($bankAccount, $myId);
 *
 * // OR get encoding line
 * $amount = '19.95';
 * $encodingLineToCopyPasteInEBanking = Bvr::getEncodingLine($bankAccount, $myId, $postAccount, $amount);
 * ```
 *
 * @see https://www.postfinance.ch/content/dam/pfch/doc/cust/download/inpayslip_isr_man_fr.pdf
 */
class Bvr
{
    private const TABLE = [
        [0, 9, 4, 6, 8, 2, 7, 1, 3, 5],
        [9, 4, 6, 8, 2, 7, 1, 3, 5, 0],
        [4, 6, 8, 2, 7, 1, 3, 5, 0, 9],
        [6, 8, 2, 7, 1, 3, 5, 0, 9, 4],
        [8, 2, 7, 1, 3, 5, 0, 9, 4, 6],
        [2, 7, 1, 3, 5, 0, 9, 4, 6, 8],
        [7, 1, 3, 5, 0, 9, 4, 6, 8, 2],
        [1, 3, 5, 0, 9, 4, 6, 8, 2, 7],
        [3, 5, 0, 9, 4, 6, 8, 2, 7, 1],
        [5, 0, 9, 4, 6, 8, 2, 7, 1, 3],
    ];

    /**
     * Get the reference number, including the verification digit
     *
     * @param string $bankAccount
     * @param string $customId
     *
     * @return string
     */
    public static function getReferenceNumber(string $bankAccount, string $customId): string
    {
        if (!preg_match('~^\d{0,20}$~', $customId)) {
            throw new Exception('Invalid custom ID. It must be 20 or less digits, but got: `' . $customId . '`');
        }

        if (!preg_match('~^\d{6}$~', $bankAccount)) {
            throw new Exception('Invalid bank account. It must be exactly 6 digits, but got: `' . $bankAccount . '`');
        }
        $value = $bankAccount . self::pad($customId, 20);

        return $value . self::modulo10($value);
    }

    /**
     * Get the full encoding line
     *
     * @param string $bankAccount
     * @param string $customId
     * @param string $postAccount
     * @param null|string $amount
     *
     * @return string
     */
    public static function getEncodingLine(string $bankAccount, string $customId, string $postAccount, ?string $amount = null): string
    {
        $type = self::getType($amount);
        $referenceNumber = self::getReferenceNumber($bankAccount, $customId);
        $formattedPostAccount = self::getPostAccount($postAccount);

        $result =
            $type . '>'
            . $referenceNumber . '+ '
            . $formattedPostAccount . '>';

        return $result;
    }

    private static function pad(string $string, int $length): string
    {
        return str_pad($string, $length, '0', STR_PAD_LEFT);
    }

    public static function modulo10(string $number): int
    {
        $report = 0;

        if ($number === '') {
            return $report;
        }

        foreach (str_split($number) as $value) {
            $report = self::TABLE[$report][$value];
        }

        return (10 - $report) % 10;
    }

    private static function getPostAccount(string $postAccount): string
    {
        if (!preg_match('~^(\d+)-(\d+)-(\d)$~', $postAccount, $m)) {
            throw new Exception('Invalid post account number, got `' . $postAccount . '`');
        }

        $participantNumber = self::pad($m[1], 2) . self::pad($m[2], 6) . $m[3];

        if (mb_strlen($participantNumber) !== 9) {
            throw new Exception('The post account number is too long, got `' . $postAccount . '`');
        }

        return $participantNumber;
    }

    /**
     * Get type of document and amount
     *
     * @param null|string $amount
     *
     * @return string
     */
    private static function getType(?string $amount): string
    {
        if ($amount === null) {
            $type = '04';
        } elseif (is_numeric($amount)) {
            $cents = bcmul($amount, '100', 0);
            $type = '01' . self::pad($cents, 10);
        } else {
            throw new Exception('Invalid amount. Must be numeric, but got: `' . $amount . '`');
        }

        return $type . self::modulo10($type);
    }
}

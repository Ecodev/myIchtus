<?php

declare(strict_types=1);

namespace Application\Model;

use Doctrine\ORM\Mapping as ORM;
use GraphQL\Doctrine\Annotation as API;

/**
 * A message sent to a user
 *
 * @ORM\Entity(repositoryClass="Application\Repository\MessageRepository")
 */
class Message extends AbstractModel implements \Ecodev\Felix\Model\Message
{
    use \Ecodev\Felix\Model\Traits\Message;

    /**
     * @var null|User
     *
     * @ORM\ManyToOne(targetEntity="User", inversedBy="messages")
     * @ORM\JoinColumns({
     *     @ORM\JoinColumn(onDelete="CASCADE")
     * })
     */
    private $recipient;

    /**
     * Set recipient
     */
    public function setRecipient(?User $recipient): void
    {
        if ($this->recipient) {
            $this->recipient->messageRemoved($this);
        }

        $this->recipient = $recipient;
        $this->setOwner($recipient);

        if ($this->recipient) {
            $this->recipient->messageAdded($this);
        }
    }

    /**
     * Get recipient
     */
    public function getRecipient(): ?User
    {
        return $this->recipient;
    }
}
